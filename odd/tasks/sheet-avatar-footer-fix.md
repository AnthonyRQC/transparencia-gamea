# Sheet Bugfix — Avatar Ref + Footer Children

## Objective
Fix two DenunciaSheet defects: Radix `asChild` ref warning on
`InvestigadorAvatar`, and mutually-exclusive footer that hides either
`children` or the case-files button.

## Scope
- `resources/js/Components/Denuncias/Shared/InvestigadorAvatar.tsx` —
  wrap with `React.forwardRef<HTMLSpanElement, InvestigadorAvatarProps>`,
  pass ref to `<span>`.
- `resources/js/Components/Denuncias/Sheet/DenunciaSheet.tsx:373-388` —
  render both `children` and `onAbrirArchivos` button stacked
  (`space-y-2`) instead of excluding each other.

## Out of scope
- Behavior changes, new features, PHPUnit changes.

## Acceptance criteria
- [ ] No Radix `asChild` ref warning for the avatar.
- [ ] Footer shows children AND files button together when both present;
  each alone when only one present; nothing when neither.
- [ ] `npm run build` clean (tsc + vite).

## Verification
- `npm run build`: clean (tsc + vite, 4652 modules, built in 46.91s)
