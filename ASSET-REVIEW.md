# AUREL image review

## Current presentation — 28 October 2026

At the user's request, the 25 labelled catalog photographs now have a presentation-only crop of the upper 5.5% edge. `src/data/watch-image-crops.ts` records the original dimensions and crop, and `WatchImage` applies it consistently in cards, galleries, collection cards, Limited Edition images, and shopping-bag thumbnails. No source image or original optimized WebP was edited. Cropped presentation does not change the AI-generated origin of the artwork.

Solace and Glen now use their original background photographs in product cards and their Limited Edition galleries, with clean cutouts retained as alternate gallery views. Their editorial sections use the supplied panoramic campaign images. The notes below record the earlier asset audit and presentation decisions, rather than the current rendering.

Reviewed the original files in `AUREL-watch-app/src/assets/Watch`, including alternate limited-edition assets and wrist photography, and the three images in `src/assets/images`. No originals were edited, regenerated, or retouched.

## Embedded “Made with AI” labels

These 23 original photographs contain visible embedded labels, and no clean version of the same product was found among the supplied assets:

| File | Product |
| --- | --- |
| `Alder.png` | Alder |
| `Apex.png` | Apex |
| `Chrono.png` | Chrono |
| `Deep Ocean.png` | Deep Ocean |
| `Elan.png` | Elan |
| `Fenwick.png` | Fenwick |
| `Heritage.png` | Heritage |
| `Interval.png` | Interval |
| `Kindle.png` | Kindle |
| `Linea.png` | Linea |
| `Monarch.png` | Monarch |
| `North.png` | North |
| `Path.png` | Path |
| `Pillar.png` | Pillar |
| `Quay.png` | Quay |
| `Regent.png` | Regent |
| `Ridge.png` | Ridge |
| `Still.png` | Still |
| `Summit.png` | Summit |
| `Titan.png` | Titan |
| `Vail.png` | Vail |
| `Velocity.png` | Velocity |
| `Woven.png` | Woven |

These images need replacement with properly licensed, clean photography of the same products. Original files and optimized WebP copies retain their embedded provenance labels unchanged. The requested centered 3:4 editorial crop prioritizes the complete watch, rather than removing a label: edge scenery, including a label in some compositions, may fall outside the frame. No labels were retouched, inpainted, or removed from the files, and a cropped presentation is not represented as a clean original. Original catalog photographs remain available in the product galleries and local source assets.

## Existing clean alternatives used

| Labeled photograph | Existing clean original | Website handling |
| --- | --- | --- |
| `Glen.png` | `Glen (2).png` | Product cards use the original clean cutout, with measured alpha bounds and its original proportions. |
| `Solace.png` | `Solace (2).png` | Product cards use the original clean cutout, with measured alpha bounds and its original proportions. |

The catalog records remain unchanged. Product-detail and limited-edition editorial pages retain their existing Glen/Solace photographs; the embedded labels remain in those source photos. The card-only overrides are recorded in `src/data/image-framing.ts`.

## Clean assets already available

No embedded label was visible in `Aster.png`, `Ballast.png`, `Marlow.png`, `Aurora.jpg`, `Aurora.png`, `Eclipse.jpg`, `Eclipse.png`, `Glen (2).png`, or `Solace (2).png`. The wrist photos and three onboarding images also have no visible label, but they are different photographs/products and were not substituted for catalog images. `Logo(2).png` is a logo rather than a product photograph.

## Layout decisions

- All product cards use the reference 3:4 portrait proportions and equal-height image frames. Wishlist buttons are inside the image area, 24px from the top and 12px from the right. The separate white utility row and added edition badges are removed. Grid columns, gutters, and product text spacing are unchanged.
- Each photograph is a single direct Next.js Image with `fill`, `object-fit: cover`, and centered positioning. There are no duplicates, blurred fills, artificial backgrounds, inset frames, image padding, or shadows. Hover adds only 1.025x scaling. Aster has a fixed 1.08x composition adjustment to match the reference, independent of motion preferences. Clean transparent Glen/Solace originals use `contain` so their straps remain intact; these are the only cutout exceptions.
- Collection cards use a consistent 3:4 portrait frame, `object-fit: cover`, and the original image aspect ratio. Portrait source photos fill the area without gray side gutters. Aster has a modest 1.08× base adjustment to balance its more distant composition; the hover increment is only 1.025×. Chrono has a slightly adjusted vertical focal point.
- The Minimal collection uses Linea's portrait photograph; Limited Edition uses Eclipse's portrait photograph. Both remain within their original collections. Product names, prices, descriptions, categories, typography, colors, shopping behavior, and Motion components are unchanged.
