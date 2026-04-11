from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "build" / "icons"
SOURCE = ICON_DIR / "source-from-user.png"
APP_ICON = ICON_DIR / "app.ico"
INSTALLER_ICON = ICON_DIR / "installer.ico"
APP_PNG = ICON_DIR / "app-512.png"
ICON_SIZES = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]


def make_square(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = max(width, height)
    background = image.convert("RGBA").getpixel((0, 0))
    canvas = Image.new("RGBA", (side, side), background)
    offset = ((side - width) // 2, (side - height) // 2)
    canvas.paste(image.convert("RGBA"), offset)
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Source image was not found: {SOURCE}")

    ICON_DIR.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGBA")
    square = make_square(image)
    base = square.resize((512, 512), Image.Resampling.LANCZOS)
    base.save(APP_PNG)
    base.save(APP_ICON, format="ICO", sizes=ICON_SIZES)
    base.save(INSTALLER_ICON, format="ICO", sizes=ICON_SIZES)
    print(APP_ICON)
    print(INSTALLER_ICON)


if __name__ == "__main__":
    main()
