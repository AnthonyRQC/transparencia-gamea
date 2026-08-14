<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use App\Helpers\DiasHabiles;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Denuncia extends Model
{
    use HasFactory, SoftDeletes, UppercaseText;

    protected $fillable = [
        'ticket',
        'token_consulta',
        'tipo',
        'escenario',
        'estado',
        'subestado',
        'categoria_id',
        'fecha_hechos',
        'hora_hechos',
        'lugar_hechos',
        'hechos',
        'declaracion_jurada',
        'tecnico_id',
        'tecnico_anterior_id',
        'fecha_admitida',
        'justificacion_admision',
        'fecha_rechazada',
        'justificacion_rechazo',
        'resumen_rechazo',
        'fecha_asignada',
        'registrado_por_id',
        'sitpreco_rechazo',
        'es_legacy',
        'traspaso_json',
        'reapertura_json',
        'conciliacion_json',
    ];

    protected $appends = ['plazo'];

    protected array $uppercaseFields = [
        'lugar_hechos', 'hechos', 'justificacion_admision',
        'justificacion_rechazo', 'resumen_rechazo',
    ];

    protected function casts(): array
    {
        return [
            'declaracion_jurada' => 'boolean',
            'es_legacy' => 'boolean',
            'fecha_hechos' => 'date',
            'fecha_admitida' => 'datetime',
            'fecha_rechazada' => 'datetime',
            'fecha_asignada' => 'datetime',
            'traspaso_json' => 'array',
            'reapertura_json' => 'array',
            'conciliacion_json' => 'array',
        ];
    }

    /**
     * Calcula la fecha de vencimiento del plazo INDEPENDIENTE del estado actual.
     * Usado por el dashboard (KPI % Cumplimiento sobre casos cerrados) y por
     * el accessor `plazo` sobre casos activos. Fix B1.
     */
    public function calcularVencimiento(): Carbon
    {
        $baseFecha = $this->fecha_admitida
            ? Carbon::parse($this->fecha_admitida)
            : Carbon::parse($this->created_at);

        $diasBase = in_array($this->estado, ['ingresada', 'evaluacion_tecnica'])
            ? 5
            : ($this->tipo === 'corrupcion' ? 45 : 20);

        $diasAmpliados = $this->relationLoaded('ampliaciones')
            ? $this->ampliaciones->sum('dias')
            : (int) $this->ampliaciones()->sum('dias');

        return DiasHabiles::agregar($diasBase + $diasAmpliados, $baseFecha);
    }

    public function getPlazoAttribute(): ?array
    {
        if (in_array($this->estado, ['rechazada', 'cerrada'])) {
            return null;
        }

        $fechaVencimiento = $this->calcularVencimiento();

        $now = Carbon::now()->startOfDay();
        $venc = $fechaVencimiento->copy()->startOfDay();

        if ($now->gt($venc)) {
            $diasRestantes = -DiasHabiles::transcurridos($venc, $now);
            if ($diasRestantes === 0) $diasRestantes = -1;
        } else {
            $diasRestantes = DiasHabiles::transcurridos($now, $venc);
        }

        if ($diasRestantes <= 3) {
            $color = 'red';
        } elseif ($diasRestantes <= 8) {
            $color = 'yellow';
        } else {
            $color = 'green';
        }

        return [
            'dias_restantes' => $diasRestantes,
            'color' => $color,
            'fecha_vencimiento' => $fechaVencimiento->format('Y-m-d'),
        ];
    }

    public static function generarSiguienteTicket(): string
    {
        return DB::transaction(function () {
            $config = ConfiguracionSistema::firstOrCreate(
                ['clave' => 'siguiente_numero_ticket'],
                ['valor' => '1', 'descripcion' => 'SIGUIENTE NÚMERO DE TICKET']
            );

            $anio = now()->year;
            $numero = (int) $config->valor;

            $ticket = sprintf('DEN-%04d-%04d', $anio, $numero);

            $config->update(['valor' => $numero + 1]);

            return $ticket;
        });
    }

    public static function reciclarTicketSiEsUltimo(string $ticket): void
    {
        if (preg_match('/^DEN-(\d{4})-(\d{4})$/', $ticket, $matches)) {
            $anioTicket = (int) $matches[1];
            $numeroTicket = (int) $matches[2];

            if ($anioTicket === now()->year) {
                $config = ConfiguracionSistema::where('clave', 'siguiente_numero_ticket')->first();
                if ($config && ((int) $config->valor === $numeroTicket + 1)) {
                    $config->update(['valor' => (string) $numeroTicket]);
                }
            }
        }
    }

    public static function generarToken(int $length = 4): string
    {
        $token = '';
        for ($i = 0; $i < $length; $i++) {
            $token .= random_int(0, 9);
        }
        return $token;
    }

    public function denunciante(): HasOne
    {
        return $this->hasOne(Denunciante::class);
    }

    public function denunciados(): HasMany
    {
        return $this->hasMany(Denunciado::class);
    }

    public function pruebas(): HasMany
    {
        return $this->hasMany(Prueba::class);
    }

    public function evaluaciones(): HasMany
    {
        return $this->hasMany(EvaluacionTecnica::class);
    }

    public function solicitudes(): HasMany
    {
        return $this->hasMany(SolicitudInformacion::class);
    }

    public function descargos(): HasMany
    {
        return $this->hasMany(Descargo::class);
    }

    public function ampliaciones(): MorphMany
    {
        return $this->morphMany(Ampliacion::class, 'entidad');
    }

    public function informe(): HasOne
    {
        return $this->hasOne(InformeFinal::class);
    }

    public function cierre(): HasOne
    {
        return $this->hasOne(Cierre::class);
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(DenunciaArchivo::class);
    }

    public function bitacora(): HasMany
    {
        return $this->hasMany(Bitacora::class);
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function tecnicoAnterior(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_anterior_id');
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_id');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaDenuncia::class);
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopePorEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopePorTecnico($query, int $tecnicoId)
    {
        return $query->where('tecnico_id', $tecnicoId);
    }
}
