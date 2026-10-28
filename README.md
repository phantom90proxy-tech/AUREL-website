# AUREL website

A separate, frontend-only Next.js App Router storefront, built from the original AUREL mobile app's assets and static product catalog. The original mobile application is unchanged.

## Run locally

```powershell
cd AUREL-website
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. For the static production preview:

```powershell
npm.cmd run build
npm.cmd start
```

`out/` is a complete static export. No backend, account, data service, payment service, or deployment is configured. The bag explicitly explains that checkout is unavailable.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npm.cmd test
npm.cmd run test:dev
```

Browser tests use installed Chrome on Windows. Set `CHROME_PATH` to another Chrome executable when needed. They start their own production preview at port 3112 and test widths of 320, 375, 412, 768, 1024, 1440, and 1920 pixels. Tests cover the navigation menu and Escape key, collection links, search, sorting, wishlist persistence, shopping quantities and totals, corrupt storage, and all product images. Screenshots are written to `test-results/`.

`npm.cmd run test:dev` runs the same suite against a live Next.js development server on port 3100, reusing it if already running. A static icon health URL allows the tests to catch page runtime errors rather than failing during server readiness. The image runtime check visits Home, All Watches, and Collections at mobile, tablet, and desktop sizes, loads all images through native scrolling, verifies one image per card without background layers, and fails on browser exceptions or console errors. Run development and production browser suites separately because they share the test-results directory.

Product cards render one Next.js Image with `fill` inside a positioned 3:4 frame. There are no inline image width/height overrides, backdrop images, blur, inset wrappers, utility strips, or card badges.

## Product framing and motion

The existing layout, typography, colors, section order, product names, prices, and shopping store are preserved. All 30 original assets were inspected together and measured. They are opaque photographs with mixed square and portrait compositions, rather than transparent product cutouts.

Product photographs now follow the supplied visual reference: one original image, a consistent 3:4 portrait frame, `object-fit: cover`, centered editorial framing, and no padding or visual effects. Aster has a fixed 1.08x composition adjustment matching the supplied reference. Wishlist buttons sit in the top-right of the image area. Existing clean Glen/Solace cutouts use `contain` without extra padding. The grid, text spacing, catalog, and Motion components are unchanged. See the asset review for the original provenance-label inventory and replacement requirements.

Collections use filled 3:4 portrait frames with safe `object-fit: cover` positioning instead of letterboxed wide containers. See [ASSET-REVIEW.md](ASSET-REVIEW.md) for the complete embedded-label inventory, clean alternatives, and remaining source-image needs.

Run `node scripts/inspect-product-images.mjs` to regenerate the asset contact sheet with reviewed watch-bound overlays and the source-dimension report in `test-results/refinement/`. Browser tests verify all 30 framing profiles at every requested width, inspect hover feedback, and exercise navigation history and the mobile menu without moving page content.

`src/components/motion.tsx` adds a 260ms page entrance, 500ms once-only editorial reveals, and a 300ms grid entrance with total stagger capped at 100ms. The initial HTML stays visible; animations begin only after enhancement and skip reduced-motion preferences. Pages remain Server Components, while small client wrappers handle motion without remounting page content or intercepting navigation. Hover/tap feedback uses short CSS transitions, with hover effects limited to pointer devices and reduced-motion overrides.

The `postbuild` step supplies dotted route-data filename aliases for a Windows separator issue in Next 16.4.3's static exporter. This keeps product-detail navigation client-side on a plain static host. It only copies generated text payloads inside `out/`; no framework patches or server rewrites are needed. The navigation test verifies that the browser document survives a product-link transition.

## Asset inspection

Read-only source: `C:/Users/Simon Christian/AUREL-watch-app/src`.

- 30 original products across Sport, Classic, Chronograph, Minimal, and Limited Edition collections.
- Original names, PHP prices, color descriptions, product descriptions, specifications, warranty text, and care guidance in `src/data/original-watches.ts`.
- Aurora, Eclipse, Solace, and Glen are the four original limited editions.
- Watch cutouts, Aurora and Eclipse editorial photography, additional limited-edition views, and wrist photography are copied locally.
- Three existing logo variants copied. The header uses the original monogram with a Cormorant wordmark.
- Existing Cormorant Garamond, Playfair Display, and Inter font files copied. The interface uses local Cormorant Garamond and Inter; body text uses a system sans serif for a lighter reading weight because the source contains only heavier Inter files.
- Brand colors preserved: `#080808`, `#F5F5F5`, with warm neutral surfaces and borders.
- Missing resources: no complete alternate-angle gallery for most products, no dedicated category campaign photography, and no regular-weight Inter font. Existing product imagery is reused in collection cards; available alternate images are offered for limited editions. Other galleries support image enlargement without inventing product views.

`npm.cmd run assets:optimize` regenerates local WebP assets from the untouched copies. Original PNG and JPG sources remain available. WebP assets are optimized at build preparation time, so the static export needs no image API.

## Organization

The global cursor uses a circular outline with a centered dot, with native cursor fallbacks for touch, reduced motion, text selection, and form fields.

Only the homepage uses the curved Collections carousel. It derives Sport, Classic, Chronograph, Minimal, and Limited Edition from the existing catalog and reuses the server-rendered `CollectionCard` imagery and filtered catalog links. Native horizontal scrolling and scroll snapping support touch and trackpads; Motion adds coordinated cylindrical depth and 650ms arrow transitions. `src/lib/collection-geometry.ts` derives every card's rotation, depth, and horizontal position from the same radius and relative distance. One moving camera and projection compensation keep image gaps consistent. A shared SVG boundary creates continuous quadratic top/bottom curves across the entire image band; it does not alter source photography. Portrait frames leave sufficient room for the original watches, with centered-watch bounds verified in browser tests. Tablet and mobile use shallower curves and smaller angles. Arrow keys, Home/End, focus handling, polite position announcements, and 48px controls support keyboard and touch navigation. The gallery loops in both directions using offscreen buffer copies that are hidden from screen readers and removed from the tab order. It silently recenters between equivalent copies after scrolling, while announcing only the five actual categories. There is no autoplay or additional carousel dependency. Reduced motion removes perspective and makes arrow movement immediate. The separate Collections page retains its original grid.

The homepage Customer Care section sits after Collections and before the closing AUREL philosophy. All its wording and confirmation labels are editable in `src/data/customer-care.ts`. Shipping and sitewide warranty terms remain “Details to be confirmed”; repair pricing is “Quote required.” The existing source catalog has generic warranty copy, but no approved sitewide claims process or repair tariff was found, so no new warranty duration, shipping fee, delivery promise, or service availability is asserted. General care tips follow the original catalog. Each column expands in place with keyboard and touch support, and animations follow the shared live reduced-motion preference.

`/about` introduces AUREL's identity and collection philosophy. `/contact` includes a direct email link and an accessible form that prepares a draft in the visitor's email app; it never submits to a website API or claims that a message was sent. Native email-form fallback is provided for JavaScript-disabled visits. The recipient in `src/data/contact.ts` comes from the original mobile project. Its placeholder telephone number and school address are intentionally omitted. Message text is not saved in localStorage.

About Us and Contact are linked in the header, floating navigation, mobile menu, and footer. With six navigation links, screens up to 1000px use the menu button to avoid crowding. The desktop pill accommodates the additional links without changing its interaction behavior.

The adaptive header preserves the original full-width presentation at the top. It enters compact mode at 140px and restores the full header at 88px to prevent threshold flicker. The fixed, centered pill keeps the same navigation and utility link elements mounted; the brand and collapsed utility actions become inert instead of disappearing from the component tree. A fixed-height outer header prevents page layout shifts.

Hover or keyboard focus reveals utilities. Click/tap pins them open or closes them; Escape returns focus to the ellipsis, and clicking outside dismisses the controls. Keyboard focus keeps actions available when the pointer leaves. Mobile uses a menu button and utilities with 44px compact touch targets. Motion transitions take 320ms for the header and 240ms for utility width, with a short icon fade; reduced-motion preferences make them immediate. Scroll processing uses a passive listener, animation-frame throttling, and state updates only on threshold crossings. Listener, frame, and media-query subscriptions are cleaned up.

- `src/app`: server-rendered pages, shared layout, metadata, styles, and static product routes.
- `src/components`: reusable layout, catalog, product, gallery, and shopping components. Client boundaries cover only interactive functionality.
- `src/data`: source catalog and website presentation adapters.
- `public`: original brand assets, self-hosted fonts, and optimized watch images.
- `tests`: browser checks for responsive layouts and shopping flows.

Shopping uses a validated localStorage store with React's `useSyncExternalStore`, a server-safe initial snapshot, cross-tab synchronization, quantity limits, and in-memory fallback when storage is unavailable. No purchase or user information is sent anywhere.

Accessibility includes semantic landmarks, a skip link, labeled controls, keyboard navigation, visible focus, live shopping feedback, and reduced-motion support. Automated browser checks do not replace an assistive-technology or physical-device audit.

## Motion preference lifecycle

The installed Motion/Framer Motion 12.43.0 `useReducedMotion` hook captures its initial value with `useState` and does not subscribe React to subsequent preference changes. A browser loaded with reduced motion can therefore retain that value after `matchMedia("(prefers-reduced-motion: reduce)").matches` becomes false. Its development warning uses `warnOnce`: it is informational, emitted once per loaded module lifetime, and can reappear after reloads or development module replacement. A fresh normal-preference load did not reproduce the warning. There is no forced `MotionConfig` setting in this application.

`src/hooks/use-motion-preference.ts` supplies a live `useSyncExternalStore` subscription instead. Its null server snapshot keeps SSR and hydration consistent and defers autoplay until the preference is known. Media changes notify React on the next animation frame so Motion's own imperative renderer has time to refresh its media-query cache before reveal effects begin. Both media listeners and pending frames are cleaned up. No warnings are filtered, no dependencies are patched, and reduced-motion accessibility remains enabled.

The header, rotating phrase, page/grid entrances, and editorial reveals use this shared preference. Switching to reduced motion stops rotation and running reveal effects; restoring normal motion resumes the phrase timer. CSS hover transitions independently follow the same native media query. `tests/motion-preference.spec.ts` exercises both initial preferences and live changes without a reload, including console/hydration diagnostics, the floating header, CTA fill, scroll reveal, and timer pause/resume.

The homepage editorial hero uses the supplied Glen and Aurora ivory photographs (original PNG copies and quality-94 WebP derivatives in `public/images/hero`). Glen appears first. Photographs crossfade over one second after six seconds at rest; autoplay pauses outside the viewport, in hidden tabs, on manual selection, or for reduced motion. Small controls allow manual selection and pause/resume. Tablet and mobile place the uncropped image below the introduction to preserve legibility.

The hero now includes all three supplied photographs: Glen, emerald rose-gold Aurora, and blue-dial Aurora, in that order. The original emerald Aurora PNG is preserved alongside its optimized WebP.

`/collections` uses full-width photographic campaign panels, each with a centered collection title and white discovery button over the artwork. Each panel uses its supplied 3840-by-2160 campaign photograph: Velocity (Sport), Monarch (Classic), Chrono (Chronograph), Linea (Minimal), and Eclipse (Limited Edition). Original PNGs and quality-92 WebP derivatives are preserved in `public/images/collections`; mobile framing keeps the watch on the right in view. All category names and descriptions come from existing local catalog data. The page-local anchor navigation tracks the visible chapter, and photography opens the matching filtered catalog. Shared cursor behavior adds VIEW only to these image links; the homepage retains DRAG. Existing embedded provenance labels remain untouched.

Collections campaign photographs now use the supplied `eclipse2.png`, `linea2.png`, `chrono2.png`, `velocity2.png`, and `monarch2.png` revisions, preserved as `*-v2.png` originals with WebP derivatives. Earlier artwork remains available.
