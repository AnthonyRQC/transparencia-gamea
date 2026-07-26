<?php

namespace App\Helpers;

use Illuminate\Support\Str;

trait UppercaseText
{
    public static function bootUppercaseText(): void
    {
        static::saving(function ($model) {
            if (property_exists($model, 'uppercaseFields')) {
                foreach ($model->uppercaseFields as $field) {
                    if (isset($model->$field) && is_string($model->$field) && $model->$field !== '') {
                        $model->$field = Str::upper($model->$field);
                    }
                }
            }
        });
    }
}
