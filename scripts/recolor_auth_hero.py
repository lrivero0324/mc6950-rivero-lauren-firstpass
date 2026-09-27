"""Hue-only regrade for the auth hero. Keeps value/texture intact."""
from PIL import Image
import colorsys

SRC = "assets/auth-hero-source.jpg"
DST = "assets/auth-hero.jpg"

TEAL_H = 168 / 360  # FirstPass forest teal
CLAY_H = 32 / 360  # warm clay for envelope, still inviting


def clamp01(x):
    return max(0.0, min(1.0, x))


def main():
    src = Image.open(SRC).convert("RGBA")
    pixels = list(src.getdata())
    out = []

    for r, g, b, a in pixels:
        if a < 10:
            out.append((r, g, b, a))
            continue

        rf, gf, bf = r / 255.0, g / 255.0, b / 255.0
        h, s, v = colorsys.rgb_to_hsv(rf, gf, bf)
        deg = h * 360

        # True grays / paper whites only
        if s < 0.03:
            out.append((r, g, b, a))
            continue

        new_h = h

        # Blues / indigos / cyan (clothes, letter, leaves, glow) -> teal
        # Keep value exact so soft washes stay soft.
        if 150 <= deg <= 280:
            new_h = TEAL_H
            if s > 0.35:
                s = clamp01(s * 0.9)

        # Coral / salmon envelope (high-sat warm reds), not soft skin
        elif (deg <= 28 or deg >= 345) and s >= 0.28 and v >= 0.45:
            new_h = CLAY_H
            s = clamp01(s * 0.82)

        # Soft pinks that read as skin: leave hue alone
        elif 28 < deg < 55 and s >= 0.45:
            new_h = CLAY_H
            s = clamp01(s * 0.88)

        rr, gg, bb = colorsys.hsv_to_rgb(new_h, s, v)
        out.append((int(rr * 255 + 0.5), int(gg * 255 + 0.5), int(bb * 255 + 0.5), a))

    img = Image.new("RGBA", src.size)
    img.putdata(out)
    # Keep JPEG crisp; flatten on soft paper white
    flat = Image.new("RGB", src.size, (255, 255, 255))
    flat.paste(img, mask=img.split()[3])
    flat.save(DST, quality=95, optimize=True, subsampling=0)
    print("wrote", DST, flat.size)


if __name__ == "__main__":
    main()
