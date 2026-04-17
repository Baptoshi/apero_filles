# Assets

Drop your brand assets here.

## `logo.png`

Overwrite the file currently at `assets/images/logo.png` with the Les Apéros Filles
logo you shared in chat. The Welcome onboarding screen loads it via
`require('@/assets/images/logo.png')` and displays it full-screen with
`resizeMode="contain"`, so any square PNG (≥ 512×512 recommended for retina)
will render correctly.

A 1×1 transparent placeholder is checked in so the Metro bundler doesn't fail
when you clone the project for the first time.
