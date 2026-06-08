# Meshlab V1 — Complete Product Build Prompt

You are the lead product engineer, product designer, and technical architect responsible for building **Meshlab**, a web application that converts a 2D reference image into an editable, downloadable 3D model.

Build Meshlab V1 as a polished, production-quality application.

Do not create only a landing page, static prototype, or collection of disconnected UI screens. Build the complete product flow using a functional mock generation provider so the application works locally before a real image-to-3D API is connected.

The final experience must feel like a real creative tool.

---

# 1. Product overview

Meshlab allows a user to:

1. Upload a 2D image of a single object.
2. Configure how the object should be reconstructed.
3. Generate a textured 3D model.
4. Inspect the result in an interactive browser-based 3D viewport.
5. Make simple edits without opening Blender.
6. Compare the generated result against the original image.
7. Export the model for use elsewhere.

Supported destinations should include:

* Blender
* Unity
* Unreal Engine
* Three.js
* Web projects
* 3D-printing software
* Other software that accepts common 3D formats

The main product promise is:

**Turn an image into an editable 3D model.**

Supporting message:

**Upload a reference, generate its form, refine it in your browser, and export it anywhere.**

Optional brand line:

**From reference to form.**

Do not claim that every result is perfectly topology-clean, game-ready, rigged, watertight, or production-ready. Results depend on the source image, visibility of the object, provider capabilities, and selected settings.

---

# 2. Product principles

Meshlab must be designed around the following principles.

## 2.1 Creative breathing room

This is a creative workspace. Users need room to observe, compare, and think.

Use blank space intentionally.

Do not fill every empty area with:

* Cards
* Borders
* Metrics
* Gradients
* Decorative copy
* Suggested actions
* AI labels
* Promotional content
* Unnecessary sidebars

The interface should feel quiet rather than empty.

## 2.2 Progressive disclosure

Do not expose every setting immediately.

The default generation experience should be understandable by a first-time user. Advanced settings should remain available but collapsed until needed.

The editor should expose only the controls relevant to the current selection or task.

## 2.3 Honest feedback

Never fabricate:

* Exact generation percentages
* Completion times
* Model statistics
* Provider capabilities
* Export support
* Saved state
* Successful uploads
* Watertight status
* Commercial licensing
* AI analysis

Only show information that is known.

## 2.4 Reversible actions

Creative experimentation should feel safe.

Meaningful edits must support undo and redo. Destructive mesh operations should create a recoverable checkpoint or a derived model asset rather than replacing the original file.

## 2.5 Viewport-first design

The generated object is the product.

The 3D viewport must receive most of the editor’s screen space. Toolbars and properties panels should support the object rather than visually competing with it.

## 2.6 No fake functionality

Do not render buttons, menu items, export formats, account integrations, or settings that appear functional but do nothing.

Future features may be shown only in a clearly separated roadmap or “Coming later” area.

---

# 3. Target users

## Primary users

### Indie game developers

They need quick props, environment objects, concept models, and prototype assets.

### 3D beginners

They want to create a model without learning the complete Blender workflow.

### Product and industrial design students

They want to convert product sketches or reference photos into rough 3D concepts.

### Illustrators and concept artists

They want to turn an object drawing into a model that can be rotated and used as a reference.

### Makers and 3D-printing hobbyists

They want to create a starting mesh that can later be repaired or prepared for printing.

## Secondary users

* Web developers creating Three.js experiences
* AR and VR developers
* Educators
* Students
* Creative agencies
* Rapid prototyping teams

---

# 4. Supported V1 inputs

V1 should focus on a single clearly visible object.

Good examples:

* Chair
* Shoe
* Camera
* Toy
* Sword
* Lamp
* Backpack
* Pottery
* Simple illustrated character
* Product concept
* Decorative object

V1 should work best when:

* The image contains one main object.
* The object occupies a meaningful portion of the image.
* The background is visually simple.
* The full object is visible.
* Lighting is reasonably clear.
* There is little motion blur.
* Important parts are not heavily occluded.
* The object boundary is distinguishable.

V1 should not claim reliable support for:

* Full rooms
* Landscapes
* Large scenes
* Groups of people
* Crowds
* Transparent objects
* Highly reflective objects
* Complex machinery
* Architecture generated from one photograph
* Invisible rear details
* Production-quality human faces
* Rigged characters
* Animation

---

# 5. V1 scope

The V1 must include:

* Product landing page
* Authentication-ready architecture
* Development guest mode
* Projects dashboard
* New project flow
* Image upload
* Clipboard image paste
* Upload validation
* Image-quality guidance
* Generation settings
* Generation review step
* Asynchronous generation jobs
* Generation progress states
* Mock image-to-3D provider
* Provider abstraction
* Project detail page
* Interactive 3D viewer
* Basic object-level editing
* Material editing
* Environment and lighting controls
* Model hierarchy for multi-mesh files
* Source-image comparison
* Undo and redo
* Autosave
* Local recovery
* Immutable generation versions
* Model statistics where available
* Export flow
* Export presets
* Recent export records
* Account settings
* Export default settings
* Usage placeholders
* Help documentation
* Responsive layouts
* Mobile model viewing
* Loading states
* Empty states
* Offline states
* Error recovery
* Accessibility support
* Unit tests
* End-to-end tests
* Setup documentation

Do not include in V1:

* Rigging
* Skeleton generation
* Animation generation
* Text-to-3D
* Full scene generation
* Room reconstruction
* AI prompt-based geometry editing
* Vertex-level modelling
* Sculpting
* Boolean modelling
* Complex retopology
* Blender-style modifiers
* CAD constraints
* Parametric modelling
* Multiplayer collaboration
* Real-time shared editing
* Public asset marketplace
* Community feed
* Mobile geometry editing
* Full billing integration
* Team workspaces
* Plugin marketplace

Do not create fake implementations of excluded features.

---

# 6. Technical stack

Use:

* Next.js App Router
* React
* TypeScript in strict mode
* Tailwind CSS
* shadcn/ui selectively
* Three.js
* React Three Fiber
* Drei
* Zustand
* TanStack Query
* Zod
* React Hook Form
* Framer Motion
* Lucide icons
* PostgreSQL-compatible database
* Supabase or a clean replaceable repository layer
* Private object storage
* Vitest
* Playwright

Use the package manager already configured in the repository. If no package manager is established, use `pnpm`.

Use current stable package versions that are mutually compatible.

Do not introduce a dependency when the same result can be achieved cleanly with the existing stack.

## 6.1 Rendering responsibilities

Use server components for:

* Initial project loading
* Project lists
* Account information
* Static marketing content
* Help content
* Initial metadata

Use client components only where interactivity requires them:

* Upload dropzone
* Generation configuration
* Generation polling
* 3D viewport
* Transform controls
* Material controls
* Dialogs
* Editor state
* Local recovery

Do not turn the entire application into client-side React unnecessarily.

## 6.2 Heavy processing

Do not perform computationally expensive 3D conversion or mesh processing inside a standard short-lived route handler.

Create abstractions for:

* Background jobs
* Queue-based processing
* Worker processing
* Provider polling
* Provider webhooks
* Export conversion jobs

The mock implementation may simulate these processes locally, but architecture must not depend on synchronous generation.

---

# 7. Repository inspection

Before writing significant code:

1. Inspect the complete repository.
2. Identify the framework and package manager.
3. Review existing components and design tokens.
4. Review authentication.
5. Review database and migrations.
6. Review storage.
7. Review current API patterns.
8. Review tests.
9. Identify dead or placeholder code.
10. Run the current application and existing tests.
11. Document what can be reused.
12. Identify weak foundations that should be refactored.

Do not overwrite working architecture without understanding it.

Do not preserve poor architecture merely because it already exists.

Before implementation, write a concise internal build plan into a project document such as:

`docs/implementation-plan.md`

Track completed and incomplete work honestly.

---

# 8. Brand and visual identity

The product name is:

# Meshlab

Use **Meshlab** consistently in:

* Navigation
* Page titles
* Metadata
* Empty states
* Emails
* Settings
* Documentation
* Sample projects
* Error messages
* Environment variables where appropriate

Do not use:

* Meahlab
* Mhlab
* Mesh Lab
* MeshLab

Create a minimal text-based wordmark.

The wordmark should:

* Work in monochrome
* Remain readable at small sizes
* Avoid illustrative 3D cube logos
* Avoid generic AI sparkle symbols
* Avoid gradients
* Feel experimental but credible

---

# 9. Visual direction

Meshlab should feel influenced by:

* Vercel
* 21st.dev
* Linear
* Raycast
* High-end creative software
* Editorial design systems

Do not clone any product directly.

The interface should be:

* Minimal
* Precise
* Calm
* Spacious
* Highly aligned
* Editorial
* Functional
* Technically credible
* Comfortable during long sessions

## 9.1 Colour

Use:

* White
* Black
* Neutral grey scale
* One restrained accent colour
* Semantic colours for success, warning, and failure

Avoid:

* Neon colours
* Rainbow gradients
* Purple AI gradients
* Excessive blue
* Bright glowing borders
* Decorative glass effects
* Gradient text
* Coloured shadows

Dark mode may be implemented, but neither mode should be treated as secondary.

The editor may default to a neutral dark viewport while the surrounding interface remains light.

## 9.2 Surfaces

Do not place every content group in a rounded card.

Use:

* Typography
* Spacing
* Alignment
* Section rhythm
* Subtle dividers
* Surface elevation only where useful

Rounded corners should be restrained and consistent.

Avoid:

* Excessively pill-shaped buttons
* Deeply nested cards
* Cards within cards
* Large floating dashboard panels
* Heavy drop shadows

## 9.3 Typography

Use a clean sans-serif typeface with strong readability.

Use typography to establish hierarchy.

Recommended hierarchy:

* Display heading
* Page title
* Section heading
* Body
* Supporting description
* Label
* Technical metadata

Use monospaced typography only for:

* Vertex counts
* Polygon counts
* Dimensions
* File sizes
* Coordinates
* Rotation values
* Scale values
* Provider IDs
* File formats
* Technical status details

Do not use monospaced typography for normal body copy.

## 9.4 Spacing

Use generous outer margins and vertical rhythm.

Marketing pages should have:

* Wide sections
* Narrow copy columns
* Large visual demonstrations
* Deliberate pauses between concepts

The editor should use space differently:

* Minimal outer padding
* Large viewport
* Compact task-specific controls
* Collapsible panels
* Small toolbars
* No decorative empty cards

## 9.5 Icons

Use Lucide icons consistently.

Every icon-only action must have:

* Accessible label
* Tooltip
* Keyboard focus state

Do not mix multiple icon libraries.

## 9.6 Motion

Use restrained motion to clarify state changes.

Appropriate motion:

* Short opacity transitions
* Small translations
* Panel expansion
* Dialog entrance
* Selection feedback
* Loading-stage transitions
* Camera framing
* View-mode transitions
* Hover and pressed feedback
* Source comparison reveal

Avoid:

* Cursor followers
* Continuous floating objects
* Excessive springs
* Bouncing buttons
* Large parallax effects
* Rotating decorative gradients
* Animations that delay input
* Long page transitions
* Excessive staggered entrances

Respect `prefers-reduced-motion`.

---

# 10. Design tokens

Create centralised design tokens for:

* Background
* Foreground
* Muted foreground
* Secondary surface
* Elevated surface
* Border
* Strong border
* Accent
* Accent foreground
* Success
* Warning
* Destructive
* Focus ring
* Viewport background
* Grid lines
* Panel width
* Toolbar height
* Radius scale
* Shadow scale
* Spacing scale
* Motion duration
* Motion easing

Do not scatter arbitrary values throughout components.

Keep the visual system consistent across marketing and product surfaces while allowing the editor to be denser than the landing page.

---

# 11. Application routes

Create these routes:

* `/`
* `/login`
* `/signup`
* `/projects`
* `/projects/new`
* `/projects/[projectId]`
* `/projects/[projectId]/generate`
* `/projects/[projectId]/editor`
* `/settings`
* `/settings/account`
* `/settings/usage`
* `/settings/export`
* `/help`

Optional internal routes:

* `/api/uploads`
* `/api/generations`
* `/api/generations/[generationId]`
* `/api/generations/[generationId]/cancel`
* `/api/webhooks/providers/[provider]`
* `/api/editor-state`
* `/api/exports`
* `/api/exports/[exportId]`

Use route handlers, server actions, or a clean combination based on the operation.

Do not expose secret provider credentials to the client.

---

# 12. Landing page

The landing page should be concise and product-led.

Do not create a long generic SaaS page with twenty sections.

## 12.1 Header

Include:

* Meshlab wordmark
* Product or workflow link
* Examples link
* Help link
* Sign in
* Primary “Create a model” action

Keep the header sparse.

Do not add enterprise, company, careers, investors, or fake pricing links unless those sections truly exist.

## 12.2 Hero

Use:

**Turn an image into an editable 3D model.**

Supporting copy:

**Upload a reference, generate its form, refine it in your browser, and export it to the tools you already use.**

Primary CTA:

**Create a model**

Secondary CTA:

**View an example**

The hero should include a real product demonstration.

Show:

* Original image
* Generated model
* A comparison interaction
* A slowly rotating object
* A small portion of the editor controls

Do not show a generic dashboard screenshot.

The product demonstration should work using bundled local sample assets.

## 12.3 Workflow

Show four steps:

1. Upload
2. Generate
3. Refine
4. Export

Each step should have:

* One short title
* One concise explanation
* One focused visual or interaction

Do not turn this into a dense feature-card grid.

## 12.4 Editor preview

Show a wide editor preview demonstrating:

* Main viewport
* Transform tool
* Materials panel
* Source comparison
* Export button

The preview should represent the real application rather than a separate fabricated design.

## 12.5 Use cases

Show a small number of use cases:

* Game assets
* Product concepts
* Illustration references
* 3D-printing starting points

Use large visuals and minimal copy.

## 12.6 Image guidance

Include an honest section explaining which images produce better results.

Show paired examples:

* Clear subject versus cluttered background
* Full object versus cropped object
* Well-lit object versus dark image
* Distinct silhouette versus heavy occlusion

## 12.7 Limitations

Explain that V1:

* Infers unseen geometry
* May require cleanup for production use
* Does not rig or animate characters
* Does not guarantee watertight printing models
* Works best with one visible object

This section should increase trust rather than feel defensive.

## 12.8 Final CTA

Use one final action:

**Create your first model**

Keep the footer minimal.

---

# 13. Authentication

Create an authentication-ready system.

Support:

* Email and password
* Magic-link architecture
* Google OAuth when configured
* GitHub OAuth when configured
* Development guest mode

Do not pretend OAuth works when environment variables are missing.

When an integration is unavailable:

* Hide it, or
* Show it as unavailable only in development diagnostics

## 13.1 Login page

Include:

* Meshlab wordmark
* Email
* Password
* Password visibility control
* Forgot-password architecture
* Sign-in button
* Magic-link option when configured
* OAuth options when configured
* Link to sign up
* Guest mode in development

## 13.2 Signup page

Include:

* Display name
* Email
* Password
* Password confirmation where appropriate
* Terms acknowledgment placeholder only if legal pages exist
* Inline validation
* Loading state
* Error state
* Link to log in

## 13.3 Authentication UX

Requirements:

* Preserve intended redirect
* Show clear invalid-credential errors
* Avoid account-enumeration leaks
* Disable duplicate form submissions
* Maintain keyboard usability
* Provide visible focus states
* Do not clear fields unnecessarily after recoverable errors

---

# 14. Projects dashboard

The projects page should feel like a quiet creative library.

## 14.1 Header

Include:

* “Projects”
* Search
* Sort
* View toggle when both grid and list are implemented
* New model button
* User menu

## 14.2 Project statuses

Support:

* Draft
* Uploading
* Queued
* Generating
* Processing geometry
* Generating textures
* Preparing model
* Ready
* Failed
* Cancelled
* Archived

Use both text and visual indicators. Do not communicate status through colour alone.

## 14.3 Project cards

Each project may show:

* Model thumbnail
* Source-image thumbnail before generation
* Project name
* Updated date
* Current status
* Active version
* File format
* Polygon count when known
* Failure indicator when relevant
* More menu

Actions:

* Open
* Rename
* Duplicate
* Archive
* Delete

Do not overload cards with metadata.

## 14.4 Sorting

Support:

* Recently updated
* Recently created
* Name
* Status

## 14.5 Search

Search by:

* Project name
* Optional description
* Version label

Use client filtering for small local datasets and server filtering when backed by a database.

## 14.6 Empty state

The first-use state should contain:

* Plenty of blank space
* Short explanation
* “Create a model” action
* Optional “Open sample project” action

Do not add fake onboarding analytics or checklists.

## 14.7 Loading state

Use restrained skeletons that match final layout dimensions.

Avoid excessive shimmering.

---

# 15. New project flow

The new project flow should feel like beginning a creative session, not completing an enterprise form.

Use a centred, focused layout with substantial blank space.

Show a simple three-step indicator:

1. Reference
2. Settings
3. Review

Do not turn the flow into separate modal dialogs.

---

# 16. Image upload

## 16.1 Input methods

Support:

* Drag and drop
* File picker
* Paste from clipboard

Accepted formats:

* PNG
* JPEG
* WEBP

Create configurable limits for:

* Maximum file size
* Minimum dimensions
* Maximum dimensions
* Maximum pixel count

Suggested initial defaults:

* Minimum: 512 × 512
* Maximum file size: 20 MB
* Maximum pixel count: configurable

Do not hardcode provider-specific limits inside visual components.

## 16.2 Validation

Validate:

* File extension
* MIME type
* File signature where server-side processing is available
* File size
* Image dimensions
* Decode success
* Empty or corrupt file
* Unsupported animation
* Excessively large image
* Transparency compatibility

Return specific messages.

Examples:

* “Use a PNG, JPEG, or WEBP image.”
* “This image is too small. Use an image at least 512 × 512.”
* “The file could not be decoded as an image.”
* “This image is too large to process.”
* “Animated images are not supported.”
* “The image contains transparency. The transparent background will be preserved where supported.”

## 16.3 Upload state

Show:

* Selected image
* File name
* Dimensions
* File size
* Replace action
* Remove action
* Upload progress
* Retry action on failure

Do not navigate away before the upload is safely recorded.

## 16.4 Image guidance

Display concise guidance:

* Use one main object.
* Keep the full object visible.
* Use a simple background.
* Avoid heavy shadows and blur.
* Include multiple views when that feature becomes available.

Do not claim certainty from simple client-side heuristics.

## 16.5 Optional heuristics

Implement lightweight client-side checks when practical:

* Resolution
* Aspect ratio
* Contrast
* Transparency
* Average brightness
* Subject coverage approximation
* Edge contact
* Potential cropping

Describe these as image checks, not AI analysis.

Example:

“Part of the subject may touch the edge of the image.”

Do not block generation for heuristic warnings unless the input is technically invalid.

---

# 17. Generation settings

Keep default controls simple.

## 17.1 Basic settings

Include:

### Model name

Default from file name, cleaned into readable text.

### Quality

* Fast
* Balanced
* Detailed

Explain these as relative quality and processing tiers. Do not fabricate exact timings.

### Geometry style

* Original
* Clean
* Stylised

Definitions:

* Original: Preserve the uploaded object’s proportions and details.
* Clean: Prefer smoother and simpler surfaces.
* Stylised: Allow simplified or exaggerated geometry.

### Texture generation

* Enabled
* Disabled

### Background removal

* Automatic
* Keep original
* Already transparent

Only expose options supported by the provider abstraction.

### Symmetry assistance

Toggle with explanation:

“Use inferred symmetry to improve hidden or unclear sides.”

### Intended use

* General
* Game asset
* Web asset
* 3D-printing starting point

These options should map to settings rather than merely changing labels.

## 17.2 Advanced settings

Keep advanced settings collapsed by default.

Possible options:

* Target polygon range
* Texture resolution
* Preserve fine details
* Smooth surface preference
* Flat base
* Watertight preference
* Mesh simplification target
* Seed
* Negative guidance
* Provider selection in development
* Provider model selection in development

Do not expose a setting that no configured provider or post-processing pipeline can use.

## 17.3 Setting validation

Validate combinations.

Examples:

* Do not allow textures when the selected provider cannot generate them.
* Explain that STL does not preserve materials.
* Warn that watertight preference may reduce fine detail.
* Warn when an extremely low polygon target conflicts with “Preserve fine details.”

---

# 18. Review step

Before generation, display:

* Source-image preview
* Project name
* Selected quality
* Geometry style
* Intended use
* Texture setting
* Background setting
* Advanced settings summary
* Relative credit usage placeholder
* Relative processing tier
* Generate button
* Back-to-settings action

Use labels such as:

* Lower usage
* Standard usage
* Higher usage

Only show exact credit counts when configured by the application.

Do not show a fake completion estimate.

---

# 19. Generation architecture

Create a provider-agnostic asynchronous generation system.

## 19.1 Provider interface

Use a typed interface similar to:

```ts
export interface ImageTo3DProvider {
  readonly id: string;
  readonly capabilities: ProviderCapabilities;

  createGeneration(
    input: GenerationInput,
  ): Promise<GenerationJob>;

  getGenerationStatus(
    providerJobId: string,
  ): Promise<GenerationStatus>;

  getGenerationResult(
    providerJobId: string,
  ): Promise<GenerationResult>;

  cancelGeneration?(
    providerJobId: string,
  ): Promise<void>;

  verifyWebhook?(
    request: Request,
  ): Promise<VerifiedProviderWebhook>;
}
```

Define typed structures for:

* Provider capabilities
* Generation input
* Generation settings
* Job status
* Generation stage
* Provider progress
* Model asset
* Texture asset
* Provider error
* Retry policy

## 19.2 Provider capabilities

Capabilities may include:

* Textures
* Background removal
* Multi-view input
* Watertight output
* Polygon targeting
* Seed control
* Cancellation
* Webhooks
* Progress events
* Multiple output formats

The UI must derive available settings from capabilities.

Do not hardcode assumptions throughout the application.

## 19.3 Mock provider

Implement `MockImageTo3DProvider`.

It must:

* Work without external credentials
* Simulate asynchronous stages
* Persist jobs
* Support polling
* Return bundled sample GLB assets
* Include textured and untextured examples
* Support deterministic success mode
* Support deterministic failure mode
* Support timeout mode
* Support cancellation
* Return model metadata
* Allow automated tests to control progression
* Never call an external API

Mock stages:

1. Preparing image
2. Analysing shape
3. Creating viewpoints
4. Reconstructing geometry
5. Cleaning mesh
6. Generating textures
7. Preparing editor
8. Complete

Do not use random percentages that jump backward or create misleading precision.

## 19.4 Real provider adapter placeholder

Create a clearly separated adapter directory.

Example:

```text
src/
  providers/
    image-to-3d/
      types.ts
      errors.ts
      provider-factory.ts
      mock-provider.ts
      real-provider-placeholder.ts
```

The placeholder should document:

* Required environment variables
* Job creation contract
* Polling
* Webhooks
* Asset retrieval
* Error mapping
* Capability mapping

Do not include fake API calls.

## 19.5 Generation job states

Support:

* Draft
* Queued
* Submitted
* Processing
* Succeeded
* Failed
* Cancelled
* Timed out

Separate overall job state from current pipeline stage.

## 19.6 Idempotency

Prevent accidental duplicate jobs caused by:

* Double clicks
* Refresh
* Request retries
* Webhook retries
* Network reconnects

Use an idempotency key tied to:

* Project
* Source asset
* Settings hash
* Intentional regenerate action

## 19.7 Webhooks and polling

Prefer webhooks when supported.

Use polling as a fallback.

Polling must:

* Back off reasonably
* Stop on terminal status
* Resume after refresh
* Pause when the page is hidden where appropriate
* Recover after transient failures
* Avoid creating duplicate requests

Webhooks must:

* Verify signatures
* Be idempotent
* Ignore stale regressions
* Map provider status into internal status
* Record useful diagnostics without exposing secrets

---

# 20. Generation progress experience

Create a dedicated generation route.

The page should contain:

* Large source-image preview
* Current stage
* Short stage explanation
* Restrained animated indicator
* Job status
* Safe navigation message
* Cancel action when supported
* Leave-page action
* Retry flow on failure

Example stage descriptions:

### Preparing image

“Validating and preparing your reference.”

### Analysing shape

“Identifying the object’s visible form and proportions.”

### Creating viewpoints

“Estimating how the object may appear from unseen angles.”

### Reconstructing geometry

“Building the initial three-dimensional surface.”

### Cleaning mesh

“Removing small defects and preparing the geometry.”

### Generating textures

“Projecting the object’s appearance onto the model.”

### Preparing editor

“Optimising the model for interactive editing.”

Do not show exact percentages unless the provider returns trustworthy progress.

When exact progress is unavailable, use stage-based indeterminate progress.

Persist generation state so users can:

* Refresh safely
* Leave the page
* Return from the dashboard
* Resume polling
* See completion later

## 20.1 Failure states

Support specific generation errors:

* Provider unavailable
* Provider rejected input
* Image could not be processed
* Generation timed out
* Output file missing
* Output file corrupt
* Texture generation failed
* Asset storage failed
* User cancelled generation
* Unknown provider error

Provide actions such as:

* Retry
* Adjust settings
* Replace image
* Continue without textures
* Return to project

Only offer actions that are valid for the error.

---

# 21. Project detail page

The project detail page should act as the bridge between generation and editing.

Include:

* Project name
* Rename action
* Source image
* Active 3D version
* Interactive model preview
* Open editor action
* Generate another version
* Version history
* Model statistics
* Recent exports
* Project metadata
* Archive
* Duplicate
* Delete

## 21.1 Model statistics

Show only available statistics:

* Polygon count
* Triangle count
* Vertex count
* Mesh count
* Material count
* Texture count
* Texture resolution
* File format
* File size
* Bounding dimensions
* Watertight status
* Normal status
* Number of disconnected components

Use “Not analysed” or “Unavailable” instead of inventing values.

## 21.2 Destructive actions

Archive should be reversible when practical.

Delete should:

* Require explicit confirmation
* Explain which source, model, texture, editor, and export records will be deleted
* Prevent accidental submission
* Handle partial cleanup failures
* Remove access immediately even when asynchronous storage cleanup remains

---

# 22. 3D editor

The editor is the central Meshlab experience.

It should feel like a lightweight creative application rather than a webpage containing a model viewer.

## 22.1 Editor layout

Use:

* Slim top toolbar
* Narrow left tool rail
* Large central viewport
* Collapsible right properties panel
* Optional bottom status strip
* Compact project navigation
* Distraction-free mode

The viewport must dominate.

Suggested desktop proportions:

* Left rail: approximately 44–56 px
* Right panel: approximately 280–340 px
* Top toolbar: approximately 44–52 px
* Remaining space: viewport

Do not place the viewport inside a large decorative card.

## 22.2 Panel behaviour

Support:

* Collapse right panel
* Restore right panel
* Remember panel preference
* Resize panel within sensible constraints
* Hide all nonessential UI
* Reopen panels with visible controls

Do not allow panels to cover most of the viewport.

## 22.3 Top toolbar

Include:

* Back to project
* Editable project name or compact title
* Save state
* Undo
* Redo
* Active version
* View controls
* Source comparison
* Export
* More menu

Save states:

* Saving
* Saved
* Offline changes
* Save failed
* Conflict detected

Do not show “Saved” before persistence succeeds.

## 22.4 Left tool rail

Tools:

* Select
* Move
* Rotate
* Scale
* Measure
* Frame object
* Reset view
* Reset transform

Suggested shortcuts:

* `V`: Select
* `G`: Move
* `R`: Rotate
* `S`: Scale
* `M`: Measure
* `F`: Frame selected object
* `Z`: Open view-mode menu
* `1`: Front
* `2`: Side
* `3`: Top
* `0`: Perspective
* `Cmd/Ctrl + Z`: Undo
* `Cmd/Ctrl + Shift + Z`: Redo
* `Escape`: Cancel current manipulation

Do not interfere with browser shortcuts when a form field is focused.

Show shortcuts in tooltips.

## 22.5 Selection

Support:

* Click mesh to select
* Click background to deselect
* Select through hierarchy
* Highlight selected mesh
* Frame selected mesh
* Lock selection
* Hide mesh
* Show hidden meshes from hierarchy

Use subtle highlighting. Avoid intense glowing outlines.

---

# 23. 3D viewport

Implement using React Three Fiber and Drei.

## 23.1 Core controls

Support:

* Orbit
* Pan
* Zoom
* Smooth damping
* Perspective camera
* Orthographic camera
* Fit-to-object
* Fit-to-selection
* Front view
* Side view
* Rear view where useful
* Top view
* Bottom view where useful
* Reset view

Camera state should not create undo-history entries.

## 23.2 Scene helpers

Support toggles for:

* Grid
* Ground plane
* Axes
* Shadows
* Environment lighting
* Bounding box
* Wireframe
* Statistics overlay in development

## 23.3 View modes

Support:

* Material
* Solid
* Wireframe
* Matcap when practical
* Normal visualisation when practical

View modes must not permanently alter exported materials.

## 23.4 Lighting presets

Provide:

* Studio
* Neutral
* Soft daylight
* Dramatic
* Flat inspection

Presets may adjust:

* Environment map
* Key light
* Fill light
* Rim light
* Exposure
* Shadow softness

The default should make models readable without disguising geometry defects.

## 23.5 Performance modes

Detect or allow selection of:

* Full quality
* Balanced
* Reduced quality

Reduced quality may disable or lower:

* Shadow resolution
* Environment resolution
* Antialiasing
* Post-processing
* Texture resolution
* Pixel ratio

Do not assume every device can comfortably render a high-poly textured asset.

## 23.6 Loading

While loading a model:

* Preserve viewport dimensions
* Show meaningful progress when available
* Avoid a blank white canvas
* Allow cancellation of stale loads
* Dispose the previous scene
* Prevent race conditions when changing versions rapidly

## 23.7 WebGL failure

Handle:

* WebGL unavailable
* Context lost
* Shader compile error
* Texture allocation failure
* Model too large
* Browser memory pressure
* Unsupported compressed texture

Provide a fallback with:

* Static thumbnail
* Model metadata
* Download action
* Troubleshooting instructions

## 23.8 Resource cleanup

Correctly dispose:

* Geometries
* Materials
* Textures
* Render targets
* Environment maps
* Event listeners
* Controls
* Workers
* Object URLs

Verify memory does not continually increase when switching between project versions.

---

# 24. Source-image comparison

Provide several comparison modes.

## 24.1 Side-by-side

Show the image and model next to each other.

Allow resizing the divider.

## 24.2 Overlay

Show the source image behind or over the model.

Controls:

* Overlay opacity
* Image scale
* Image position
* Camera-alignment reset

## 24.3 Quick toggle

Hold or activate a control to temporarily show the source image.

## 24.4 Reference panel

Allow the source image to remain in a small collapsible panel.

The comparison system should be discoverable without permanently taking over the editor.

---

# 25. Transform editing

V1 supports object-level transforms.

Support:

* Position X, Y, Z
* Rotation X, Y, Z
* Scale X, Y, Z
* Uniform scale lock
* Transform gizmos
* Numeric inputs
* Reset individual axis
* Reset complete transform
* Local and world coordinates when practical

## 25.1 Snapping

Support:

* Position snapping
* Rotation snapping
* Scale snapping

Suggested defaults:

* Position: disabled
* Rotation: 15°
* Scale: 0.1

Allow users to customise increments.

## 25.2 Transform lifecycle

During drag:

* Update the viewport immediately
* Avoid saving on every pointer event
* Commit one meaningful history entry when the drag ends
* Autosave after commit
* Allow `Escape` to cancel when practical

Numeric inputs should:

* Validate values
* Support keyboard increments
* Commit logically
* Avoid creating a history item for every keystroke

---

# 26. Geometry operations

V1 geometry operations must remain limited and safe.

Potential supported actions:

* Centre model
* Place model on ground
* Recalculate normals
* Flip normals
* Smooth shading
* Flat shading
* Remove tiny disconnected components
* Basic mesh simplification
* Merge compatible meshes where safe
* Generate a flat base
* Basic hole fill where reliable

Only implement an operation when it genuinely works.

## 26.1 Operation requirements

Every geometry operation must:

* Explain its effect
* Explain whether it is destructive
* Show processing state
* Create an undo checkpoint or derived asset
* Preserve the original generation
* Handle failure
* Avoid blocking the main UI when possible
* Record operation metadata
* Update model statistics after completion

## 26.2 Mesh simplification

Allow:

* Target percentage
* Approximate target triangle count
* Preview warning
* Cancel before confirmation
* Comparison against original version

Explain that simplification may affect:

* Silhouette
* Small details
* UVs
* Normals
* Texture appearance

## 26.3 Printing helpers

For “3D-printing starting point,” allow:

* Place on ground
* Flat-base generation where supported
* Watertight analysis
* Component analysis
* Scale-unit selection

Do not claim that the result is print-ready unless it passes the relevant analysis.

---

# 27. Material editor

Support standard PBR materials where available.

## 27.1 Material properties

Include:

* Base colour
* Roughness
* Metallic
* Emissive colour
* Emissive intensity
* Opacity
* Alpha mode
* Double-sided rendering
* Normal-map strength
* Texture visibility

Do not expose unsupported shader controls.

## 27.2 Material list

For multi-material models, allow:

* Select material
* Rename material
* Identify assigned meshes
* Temporarily disable material textures
* Reset material
* Duplicate material when supported

## 27.3 Texture controls

Allow users to:

* View texture files
* Toggle texture maps
* Upload a replacement base-colour texture when practical
* Reset to generated texture
* Inspect texture resolution
* See missing-texture warnings

Possible texture maps:

* Base colour
* Normal
* Roughness
* Metallic
* Emissive
* Occlusion

Only render maps that exist.

## 27.4 Material changes

Material changes must:

* Update immediately in the viewport
* Be undoable
* Autosave after debounce
* Remain separate from original generated material data
* Be reflected in supported exports

---

# 28. Environment controls

Support preview controls:

* Background colour
* Transparent background
* Environment preset
* Environment intensity
* Light intensity
* Exposure
* Shadow intensity
* Ground visibility
* Ground colour
* Grid visibility
* Grid size
* Grid subdivisions

Clearly distinguish preview settings from model properties.

Environment settings should not affect exported geometry unless the export format intentionally stores scene settings.

---

# 29. Model hierarchy

If the model contains multiple meshes, provide a compact hierarchy panel.

Support:

* Select mesh
* Rename mesh
* Toggle visibility
* Lock mesh
* Frame mesh
* Show assigned material
* Identify hidden meshes
* Expand and collapse groups

Do not recreate Blender’s complete outliner.

The hierarchy should remain approachable for non-experts.

---

# 30. Measurement tool

Implement a basic measurement tool.

Support:

* Click first point
* Click second point
* Display distance
* Choose unit
* Clear measurement
* Store measurements only when explicitly saved

Units:

* Millimetres
* Centimetres
* Metres
* Inches

Explain when model scale is inferred rather than known.

Do not present inferred dimensions as real-world truth without user calibration.

Optional calibration flow:

1. User selects two points.
2. User enters the known distance.
3. Meshlab scales the model accordingly.
4. The scale change is recorded as an editor action.

---

# 31. Undo and redo

Implement meaningful editor history.

Use a command-based, patch-based, or immutable-state architecture.

Track:

* Final transform commits
* Material property changes
* Visibility changes
* Rename operations
* Environment settings
* Supported geometry operations
* Scale calibration

Do not track:

* Camera orbit
* Hover
* Panel opening
* Tooltips
* Pointer movement
* Temporary transform preview
* Selection unless needed for a specific workflow

Set a sensible history limit.

Handle history across autosave without losing the current local stack.

---

# 32. Autosave and recovery

Autosave meaningful changes after a debounce.

## 32.1 Autosave requirements

* Optimistically update local state
* Persist a revision number
* Retry temporary failures
* Avoid duplicate writes
* Display saving state
* Display saved state only after acknowledgement
* Preserve pending changes offline
* Recover pending changes on reconnect
* Detect server conflicts
* Avoid silently overwriting newer revisions

## 32.2 Local recovery

Store recoverable editor changes locally using an appropriate browser persistence mechanism.

On return after a crash or refresh:

* Compare local revision with server revision
* Restore safely when local state is newer
* Ask the user before replacing conflicting remote state
* Allow discarding local recovery

Do not show navigation warnings when all changes are saved.

---

# 33. Version history

Every generation result is an immutable generation version.

A project may contain multiple versions.

Each version should record:

* ID
* Project ID
* Source asset
* Generation settings
* Provider
* Provider model
* Provider job ID
* Generation status
* Pipeline stage
* Progress when trustworthy
* Output assets
* Thumbnail
* Model statistics
* Error details
* Created date
* Completed date
* User label
* Active status

Users can:

* Generate another version
* Switch active version
* Compare versions
* Rename a version
* Duplicate settings
* Regenerate from settings
* Delete a version
* Open a version in the editor

Editor state should be stored per version.

Never overwrite the original generated model when the user edits it.

---

# 34. Version comparison

Support a simple version-comparison view.

Possible modes:

* Side-by-side models
* Synchronized camera rotation
* Alternating toggle
* Statistics comparison
* Source-image comparison

Show differences in:

* File size
* Polygon count
* Vertex count
* Texture resolution
* Mesh count
* Generation settings

Do not attempt advanced geometry-diff visualisation in V1 unless it can be implemented reliably.

---

# 35. Export workflow

Export must be a deliberate process.

Do not make the export button immediately download an unexplained file.

## 35.1 Supported V1 formats

Support when technically implemented:

* GLB
* GLTF
* OBJ
* STL

Only include FBX when a dependable conversion pipeline exists.

Do not show FBX as functional otherwise.

## 35.2 Export presets

Provide:

* Blender
* Unity
* Unreal Engine
* Three.js / Web
* 3D Printing
* Custom

Each preset should configure useful defaults.

### Blender

Suggested defaults:

* GLB
* Include textures
* Apply transforms
* Preserve materials
* Y-up or appropriate conversion explanation

### Unity

Suggested defaults:

* GLB or supported format
* Metre scale
* Include textures
* Apply transforms
* Engine-compatible orientation

### Unreal Engine

Suggested defaults:

* Appropriate coordinate conversion
* Metre or centimetre scale
* Embedded or packaged textures
* Applied transforms

### Three.js / Web

Suggested defaults:

* GLB
* Embedded textures
* Reduced texture size option
* Mesh compression when implemented
* Applied transforms

### 3D Printing

Suggested defaults:

* STL
* Millimetres
* Apply transforms
* No textures
* Watertight warning
* Component warning

Do not assume that every engine has identical coordinate conventions.

## 35.3 Export settings

Include:

* Format
* File name
* Apply transforms
* Include textures
* Embed textures when supported
* Include materials
* Coordinate orientation
* Unit scale
* Texture resolution
* Mesh simplification
* Binary or ASCII STL where supported
* Visible meshes only
* Merge meshes where supported
* Preserve hierarchy where supported

## 35.4 Pre-export analysis

Check for:

* Missing textures
* Missing materials
* Negative scale
* Very high polygon count
* Disconnected components
* Non-manifold geometry
* Non-watertight mesh
* Unsupported material properties
* Hidden meshes
* Zero-scale objects
* Unapplied transforms
* Invalid normals

Warnings should distinguish between:

* Blocking issue
* Important warning
* Informational note

## 35.5 Export job

For expensive conversion:

* Create an asynchronous export job
* Show progress or current stage
* Allow safe navigation
* Retry failures
* Persist export record
* Store the resulting file when configured
* Generate a secure download URL

## 35.6 Export completion

Show:

* File name
* Format
* File size
* Created date
* Download action
* Re-export action
* Destination guidance

Record recent exports on the project page.

---

# 36. Data model

Create a typed database schema.

## 36.1 User

Fields:

* `id`
* `displayName`
* `email`
* `avatarUrl`
* `createdAt`
* `updatedAt`

## 36.2 Project

Fields:

* `id`
* `userId`
* `name`
* `description`
* `status`
* `activeVersionId`
* `thumbnailAssetId`
* `createdAt`
* `updatedAt`
* `archivedAt`
* `deletedAt`

## 36.3 SourceAsset

Fields:

* `id`
* `projectId`
* `storagePath`
* `originalFileName`
* `mimeType`
* `width`
* `height`
* `fileSize`
* `checksum`
* `createdAt`

## 36.4 GenerationVersion

Fields:

* `id`
* `projectId`
* `sourceAssetId`
* `label`
* `status`
* `stage`
* `progress`
* `provider`
* `providerModel`
* `providerJobId`
* `settings`
* `settingsHash`
* `modelAssetId`
* `errorCode`
* `errorMessage`
* `createdAt`
* `updatedAt`
* `completedAt`
* `cancelledAt`

## 36.5 ModelAsset

Fields:

* `id`
* `generationVersionId`
* `storagePath`
* `format`
* `mimeType`
* `fileSize`
* `checksum`
* `polygonCount`
* `triangleCount`
* `vertexCount`
* `meshCount`
* `materialCount`
* `textureCount`
* `textureResolution`
* `boundingBox`
* `isWatertight`
* `componentCount`
* `createdAt`

## 36.6 TextureAsset

Fields:

* `id`
* `modelAssetId`
* `storagePath`
* `textureType`
* `mimeType`
* `width`
* `height`
* `fileSize`
* `createdAt`

## 36.7 EditorState

Fields:

* `id`
* `generationVersionId`
* `revision`
* `transforms`
* `materials`
* `meshVisibility`
* `meshNames`
* `previewSettings`
* `measurements`
* `updatedAt`

## 36.8 DerivedModelAsset

Use this for destructive or server-processed edits.

Fields:

* `id`
* `generationVersionId`
* `parentModelAssetId`
* `operationType`
* `operationSettings`
* `storagePath`
* `format`
* `modelStatistics`
* `createdAt`

## 36.9 ExportRecord

Fields:

* `id`
* `projectId`
* `generationVersionId`
* `status`
* `format`
* `preset`
* `settings`
* `storagePath`
* `fileName`
* `fileSize`
* `errorCode`
* `errorMessage`
* `createdAt`
* `completedAt`

## 36.10 UsageRecord

Fields:

* `id`
* `userId`
* `projectId`
* `generationVersionId`
* `type`
* `credits`
* `provider`
* `providerModel`
* `metadata`
* `createdAt`

Use JSON only for flexible settings and state documents.

Keep important searchable and relational fields normalized.

Add:

* Foreign keys
* Ownership indexes
* Status indexes
* Updated-date indexes
* Unique provider-job constraints where appropriate
* Safe cascade behaviour
* Soft deletion where needed

---

# 37. Storage architecture

Use private storage buckets.

Possible organisation:

```text
users/{userId}/projects/{projectId}/sources/{assetId}
users/{userId}/projects/{projectId}/versions/{versionId}/models/{assetId}
users/{userId}/projects/{projectId}/versions/{versionId}/textures/{assetId}
users/{userId}/projects/{projectId}/versions/{versionId}/derived/{assetId}
users/{userId}/projects/{projectId}/exports/{exportId}
```

Requirements:

* Signed URLs
* Short-lived access
* Ownership validation
* Safe generated file names
* MIME validation
* File-signature validation
* Checksums where useful
* Upload limits
* Cleanup jobs
* Abandoned-upload cleanup
* Failed-generation cleanup
* Safe project deletion
* No public-by-default source assets

Do not trust client-provided storage paths.

---

# 38. Application operations

Implement typed operations for:

* Create project
* List projects
* Read project
* Rename project
* Duplicate project
* Archive project
* Restore project
* Delete project
* Create source upload
* Confirm source upload
* Replace source image
* Create generation version
* Get generation status
* Cancel generation
* Retry generation
* Receive provider webhook
* Set active version
* Rename version
* Delete version
* Load editor state
* Save editor state
* Execute geometry operation
* Create export
* Get export status
* Download export
* List exports
* Read usage
* Update account
* Update export defaults

Every project-scoped operation must verify ownership.

Never trust a user-supplied project ID without an authorization check.

---

# 39. State architecture

Separate these forms of state.

## 39.1 Server state

Examples:

* Projects
* Versions
* Generation jobs
* Assets
* Export records
* Usage

Use TanStack Query or server-component data loading appropriately.

## 39.2 Editor document state

Examples:

* Transforms
* Materials
* Visibility
* Mesh names
* Environment
* Measurements
* Active derived asset

Use a disciplined Zustand store divided into slices.

## 39.3 Viewport state

Examples:

* Selected mesh
* Active tool
* Camera mode
* Current gizmo
* Hovered mesh
* Temporary drag state

Do not persist temporary viewport state unless it affects the user’s document.

## 39.4 UI state

Examples:

* Open dialog
* Panel width
* Collapsed sections
* Active tab
* Tooltip
* Command menu

Persist only useful preferences.

## 39.5 Generation state

Examples:

* Current job
* Polling status
* Provider stage
* Retry state
* Cancellation state

Do not merge all state into one giant store.

---

# 40. Component architecture

Create focused reusable components.

Suggested structure:

```text
components/
  marketing/
  auth/
  projects/
  upload/
  generation/
  editor/
    viewport/
    toolbar/
    tools/
    properties/
    materials/
    hierarchy/
    comparison/
    export/
  settings/
  shared/
```

Suggested components:

* `AppShell`
* `MarketingHeader`
* `MeshlabWordmark`
* `ProjectGrid`
* `ProjectList`
* `ProjectCard`
* `ProjectStatus`
* `UploadDropzone`
* `ClipboardImageInput`
* `ImagePreview`
* `ImageQualityHints`
* `GenerationSettingsForm`
* `AdvancedSettings`
* `GenerationReview`
* `GenerationProgress`
* `GenerationFailure`
* `ModelPreview`
* `ModelViewport`
* `ViewportScene`
* `ViewportToolbar`
* `TransformToolRail`
* `CameraControls`
* `ViewModeMenu`
* `PropertiesPanel`
* `TransformPanel`
* `GeometryPanel`
* `MaterialEditor`
* `TextureList`
* `EnvironmentControls`
* `ModelHierarchy`
* `SourceComparison`
* `VersionSwitcher`
* `VersionComparison`
* `ModelStats`
* `ExportDialog`
* `ExportPresetPicker`
* `ExportWarnings`
* `SaveStatus`
* `OfflineIndicator`
* `EmptyState`
* `ErrorState`
* `ConfirmDialog`

Do not create one enormous editor component.

Keep:

* Rendering
* State
* Commands
* Persistence
* Provider logic
* Export logic

in separate modules.

---

# 41. Responsive behaviour

## 41.1 Marketing

The landing page should work fully on:

* Mobile
* Tablet
* Desktop

Maintain whitespace without producing absurd empty scroll length on mobile.

## 41.2 Dashboard

Support:

* Responsive project grid
* Compact project list
* Mobile new-project action
* Mobile search and sorting
* Touch-friendly menus

## 41.3 New project flow

The upload and settings flow should work fully on mobile.

## 41.4 Editor

Desktop and large tablets:

* Full editing experience

Smaller tablets:

* Model viewing
* Basic transforms
* Material adjustments
* Export

Phones:

* View model
* Orbit
* Zoom
* Switch versions
* View statistics
* Download existing exports
* Start a new generation when practical

Do not compress the complete desktop editor into a narrow mobile screen.

Show a clear notice:

“Full model editing works best on a larger screen.”

Do not completely block mobile users from viewing their work.

---

# 42. Accessibility

Aim for WCAG AA where practical.

Requirements:

* Visible keyboard focus
* Logical tab order
* Semantic headings
* Form labels
* Accessible validation
* Accessible dialogs
* Focus trapping
* Focus restoration
* Escape-to-close where appropriate
* Screen-reader labels
* Non-colour status communication
* Reduced-motion support
* Sufficient contrast
* Keyboard tool selection
* Keyboard undo and redo
* Canvas fallback text
* Accessible export warnings
* Accessible save-state announcements
* Touch target sizing

Tooltips must work on:

* Hover
* Keyboard focus

The 3D canvas is visual by nature, but all surrounding controls must remain accessible.

Provide a text summary of the current model:

* Mesh count
* Material count
* Dimensions
* Selected mesh
* Current tool

---

# 43. Empty states

Design specific empty states for:

* No projects
* Project with no uploaded image
* Project with no generated version
* Model with no textures
* No exports
* No usage records
* Empty hierarchy
* No search results

Each empty state should provide:

* Clear explanation
* One useful primary action
* Optional secondary action

Do not fill empty states with decorative illustrations unless they genuinely improve comprehension.

---

# 44. Error handling

Create typed application errors.

Handle:

* Unsupported file
* Corrupt image
* File too large
* Image too small
* Upload interrupted
* Upload expired
* Storage unavailable
* Authentication failure
* Authorization failure
* Provider unavailable
* Provider rate limit
* Provider rejection
* Generation timeout
* Missing generation output
* Corrupt model
* Missing texture
* WebGL unavailable
* WebGL context loss
* Browser out of memory
* Model too large
* Save failure
* Revision conflict
* Offline state
* Geometry-operation failure
* Export failure
* Signed URL expiry
* Project not found
* Version not found

Every error should answer:

1. What happened?
2. Was any work lost?
3. What can the user do next?

Avoid generic “Something went wrong” messages when more detail is available.

Do not display raw provider errors, stack traces, storage paths, or secrets to end users.

---

# 45. Offline behaviour

The application does not need complete offline generation.

It should support:

* Detecting offline state
* Preserving unsaved editor changes
* Pausing unnecessary polling
* Retrying autosave after reconnect
* Showing cached project information when available
* Explaining that generation and export require a connection

Do not claim that generation continues locally when it does not.

---

# 46. Performance

Optimise for a smooth creative workspace.

## 46.1 Application loading

* Lazy-load Three.js and editor dependencies.
* Code-split the editor.
* Avoid loading the editor bundle on marketing routes.
* Use streaming and suspense appropriately.
* Preload the editor when the user is likely to open it.
* Optimise fonts.
* Compress thumbnails.

## 46.2 Viewport

* Clamp device pixel ratio.
* Dispose resources.
* Avoid unnecessary scene recreation.
* Memoise stable objects.
* Pause rendering where possible when hidden.
* Use demand-based rendering when compatible with interactions.
* Reduce texture resolution on weak devices.
* Warn before loading extremely large models.
* Consider mesh compression support.
* Avoid expensive post-processing in V1.

## 46.3 State

* Debounce autosave.
* Batch transform updates.
* Avoid global rerenders during pointer movement.
* Subscribe to small Zustand slices.
* Keep camera state outside frequently persisted document state.

## 46.4 Expensive operations

Use Web Workers where practical for:

* Model analysis
* Format conversion
* Simplification
* Thumbnail generation
* Checksums
* Geometry inspection

Do not freeze the main thread during export.

## 46.5 Instrumentation

Add internal instrumentation for:

* Route-load time
* Model-load time
* Texture-load failures
* Generation failures
* Export failures
* WebGL context loss
* Save latency
* Memory-related fallbacks

Do not add invasive analytics without consent architecture.

---

# 47. Security

Implement:

* Ownership checks
* Private storage
* Signed asset URLs
* Strict upload validation
* File-signature checks
* Size limits
* Sanitised file names
* Provider secrets only on server
* Webhook verification
* Idempotent webhook processing
* Safe redirect handling
* CSRF-safe mutation architecture
* Rate-limit-ready endpoints
* Content Security Policy
* Restricted iframe and worker origins
* Safe object URL cleanup
* Safe account deletion
* Audit-friendly server logs

Do not trust:

* Client MIME type
* Client file name
* Client dimensions
* Client project ownership
* Client export path
* Client provider status
* Client-supplied usage cost

Do not execute uploaded content.

---

# 48. Privacy

Clearly communicate:

* Uploaded images are used to generate requested models.
* Assets remain private by default.
* Projects are not publicly searchable.
* A configured external provider may process uploaded images.
* Users can delete projects.
* Deletion may involve asynchronous cleanup from storage.
* Assets are not used for unrelated training unless this is explicitly true and disclosed.

Do not claim local-only processing unless the configured provider runs locally.

Create privacy copy that adapts based on provider configuration where practical.

---

# 49. Usage page

Create a simple usage page.

Show:

* Remaining configured credits where applicable
* Generation history
* Export processing usage where applicable
* Quality tier
* Provider
* Date
* Status

When billing is not configured:

* Explain that usage tracking is in development or running in development mode.
* Do not invent currency pricing.
* Do not invent subscription tiers.
* Do not show fake invoices.

---

# 50. Export defaults page

Allow users to configure:

* Default format
* Default preset
* Apply transforms
* Include textures
* Coordinate orientation
* Unit
* Texture size
* Visible meshes only
* Default file-name pattern

Validate settings against format capabilities.

Example:

STL cannot include textures or PBR materials.

---

# 51. Account settings

Include:

* Display name
* Email
* Avatar
* Authentication methods where configured
* Sign out
* Delete account

Account deletion flow must:

* Explain consequences
* Require confirmation
* Prevent accidental submission
* Re-authenticate when appropriate
* Revoke access promptly
* Start asset cleanup
* Report cleanup failures internally

Do not pretend account deletion has completed when only the UI state changed.

---

# 52. Help centre

Create a concise help page with sections for:

* Choosing a good source image
* Supported image formats
* Generation settings
* Understanding model versions
* Editor basics
* Transform controls
* Materials
* Geometry limitations
* Exporting to Blender
* Exporting to Unity
* Exporting to Unreal Engine
* Exporting for the web
* 3D-printing limitations
* Troubleshooting generation
* Troubleshooting WebGL
* Privacy
* Deleting assets

Include keyboard shortcuts.

Keep help content readable and visual.

---

# 53. Sample projects

Bundle original or permissively licensed local assets.

Create sample projects such as:

* Ceramic chair
* Stylised sneaker
* Low-poly camera
* Toy spacecraft

Each sample should include:

* Source image
* GLB model
* Thumbnail
* Metadata
* Materials
* Model statistics
* Suggested export preset

Do not use:

* Copyrighted characters
* Recognisable branded products
* Scraped assets with unclear licensing
* Fake commercial work

Use the same sample assets for:

* Landing demonstration
* Guest mode
* Mock provider
* Automated tests where appropriate

---

# 54. Development guest mode

The application must be testable without authentication or external provider credentials.

Guest mode should:

* Be enabled only in development or through explicit configuration
* Use local sample projects
* Allow complete mock generation
* Allow editor testing
* Allow export testing
* Persist locally or through a development database
* Clearly indicate development mode

Do not accidentally enable insecure guest access in production.

---

# 55. Testing

Add meaningful tests.

## 55.1 Unit tests

Test:

* File validation
* MIME validation logic
* Image dimension validation
* Generation settings schema
* Provider-capability mapping
* Provider status mapping
* Provider error mapping
* Export preset mapping
* Export format constraints
* Unit conversion
* Model-stat formatting
* File-size formatting
* Editor command history
* Transform commits
* Material updates
* Autosave debounce
* Revision conflict handling
* Ownership guards
* Settings hashing
* Idempotency-key generation

## 55.2 Component tests

Test:

* Upload dropzone
* Invalid upload feedback
* Generation settings form
* Advanced-settings disclosure
* Progress-stage rendering
* Save-status transitions
* Export warnings
* Material controls
* Project status
* Error recovery

## 55.3 End-to-end tests

Test complete flows:

1. Enter guest mode.
2. Create project.
3. Upload valid image.
4. Reject invalid image.
5. Configure generation.
6. Review settings.
7. Start mock generation.
8. Observe progress.
9. Refresh during generation.
10. Resume generation state.
11. Open completed model.
12. Select model.
13. Move model.
14. Rotate model.
15. Scale model.
16. Modify material.
17. Undo change.
18. Redo change.
19. Refresh editor.
20. Restore persisted state.
21. Compare source image.
22. Generate another version.
23. Switch versions.
24. Export GLB.
25. Export STL.
26. Show correct STL texture warning.
27. Simulate provider failure.
28. Retry generation.
29. Simulate offline autosave.
30. Reconnect and save.
31. Archive project.
32. Restore project.
33. Delete project.

## 55.4 Visual review

Inspect:

* Landing page
* Login
* Signup
* Empty projects
* Populated projects
* Upload state
* Review state
* Every generation stage
* Generation failure
* Project detail
* Editor
* Collapsed editor
* Source comparison
* Export dialog
* Settings
* Help
* Mobile layouts
* Dark mode if implemented
* Reduced-motion mode

Do not rely only on tests. Manually inspect the actual interface.

---

# 56. Developer experience

Create:

* `README.md`
* `.env.example`
* Database migration files
* Seed script
* Sample asset setup
* Mock provider guide
* Real provider integration guide
* Storage setup guide
* Testing guide
* Architecture documentation
* Editor-state documentation
* Export pipeline documentation

Provide scripts for:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm seed
```

The basic local flow should be approximately:

```bash
pnpm install
cp .env.example .env.local
pnpm seed
pnpm dev
```

Mock mode should work with minimal setup.

---

# 57. Environment configuration

Document variables similar to:

```env
NEXT_PUBLIC_APP_URL=
DATABASE_URL=

AUTH_PROVIDER=
AUTH_SECRET=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

IMAGE_TO_3D_PROVIDER=mock
IMAGE_TO_3D_API_KEY=
IMAGE_TO_3D_WEBHOOK_SECRET=

ENABLE_GUEST_MODE=true
ENABLE_USAGE_TRACKING=false
ENABLE_PERSISTED_EXPORTS=true
```

Do not expose secret variables through `NEXT_PUBLIC_`.

Validate required environment variables at startup.

Show useful development errors when configuration is incomplete.

---

# 58. Code quality

Requirements:

* Strict TypeScript
* No broad `any`
* No untyped provider responses
* No dead placeholder components
* No silent error swallowing
* No hardcoded credentials
* No fake buttons
* No duplicate business logic
* No giant all-purpose Zustand store
* No monolithic editor component
* No arbitrary timeout-driven orchestration
* No inaccessible icon buttons
* No fragile DOM querying
* No direct mutation of Three.js resources without lifecycle control
* No unnecessary client components
* No provider-specific logic scattered through UI components

Use comments only when they explain:

* Non-obvious architecture
* Three.js lifecycle decisions
* Provider compatibility logic
* Security requirements
* Complex export behaviour

Do not write comments that merely restate code.

---

# 59. Suggested folder structure

Adapt this structure to the existing repository rather than forcing it blindly:

```text
src/
  app/
    (marketing)/
    (auth)/
    (product)/
    api/
  components/
    marketing/
    auth/
    projects/
    upload/
    generation/
    editor/
    settings/
    shared/
  features/
    projects/
    generation/
    editor/
    exports/
    usage/
  providers/
    image-to-3d/
  server/
    auth/
    database/
    storage/
    jobs/
    repositories/
  stores/
    editor/
    viewport/
    ui/
  lib/
    validation/
    errors/
    formatting/
    geometry/
    exports/
  workers/
  hooks/
  types/
  styles/
  tests/
```

Prefer feature boundaries over an unstructured global components directory.

---

# 60. Build sequence

Work in this order.

## Phase 1: Foundation

1. Inspect repository.
2. Run current app and tests.
3. Create implementation plan.
4. Establish design tokens.
5. Establish typography.
6. Establish app shell.
7. Define domain types.
8. Create database schema.
9. Create repository interfaces.
10. Configure development guest mode.

## Phase 2: Core product flow

11. Build landing page.
12. Build login and signup.
13. Build projects dashboard.
14. Build project creation.
15. Build upload pipeline.
16. Add upload validation.
17. Build settings flow.
18. Build review step.
19. Implement provider abstraction.
20. Implement mock provider.
21. Build asynchronous generation state.
22. Build generation progress page.
23. Persist refresh-safe generation jobs.

## Phase 3: Model experience

24. Build project detail page.
25. Build model loading.
26. Build 3D viewport.
27. Add camera controls.
28. Add view modes.
29. Add lighting presets.
30. Add source comparison.
31. Add model statistics.
32. Add version switching.

## Phase 4: Editing

33. Create editor-state architecture.
34. Add selection.
35. Add transform gizmos.
36. Add numeric transform controls.
37. Add snapping.
38. Add material editing.
39. Add environment controls.
40. Add hierarchy.
41. Add measurement.
42. Add undo and redo.
43. Add autosave.
44. Add local recovery.
45. Add safe geometry operations that genuinely work.

## Phase 5: Export and completion

46. Build export dialog.
47. Add export presets.
48. Add pre-export validation.
49. Implement supported conversion.
50. Persist export records.
51. Build account settings.
52. Build usage page.
53. Build export defaults.
54. Build help centre.
55. Add mobile behaviour.
56. Add accessibility improvements.
57. Add tests.
58. Run performance audit.
59. Run memory audit.
60. Run security audit.
61. Run UX audit.
62. Fix discovered issues.
63. Complete documentation.

Do not stop after Phase 2.

Do not report the application as finished while the editor or export path is still static.

---

# 61. UX audit checklist

Before completion, verify:

* A first-time user understands Meshlab from the landing page.
* The user can create a project without confusion.
* Upload errors are specific.
* The generation settings are understandable.
* Advanced settings do not overwhelm beginners.
* Generation survives refresh.
* Generation failures are recoverable.
* The viewport receives most of the editor.
* The model is easy to frame and inspect.
* Tools have labels and shortcuts.
* Transform interactions are smooth.
* Material controls update immediately.
* Undo and redo behave predictably.
* Autosave is trustworthy.
* Offline edits are not silently lost.
* Source comparison is discoverable.
* Versions are clearly separated.
* Export presets make sense.
* Format limitations are explained.
* There are no decorative nonfunctional controls.
* Empty states are useful.
* Blank space remains intentional.
* The interface does not resemble a generic AI dashboard.
* No route feels visually disconnected.
* Long names do not break layouts.
* Keyboard navigation works.
* Reduced-motion mode works.
* Mobile does not simply shrink the desktop editor.

---

# 62. Performance and memory audit

Before completion:

1. Open and close the editor repeatedly.
2. Switch model versions repeatedly.
3. Load textured and untextured models.
4. Toggle comparison modes.
5. Change environment presets.
6. Start and cancel generation polling.
7. Export multiple formats.
8. Navigate between projects.
9. Monitor detached objects.
10. Monitor retained textures and geometries.
11. Confirm object URLs are revoked.
12. Confirm old render resources are disposed.
13. Confirm polling stops on unmount.
14. Confirm workers terminate.
15. Confirm large assets trigger warnings.
16. Confirm weak-device mode reduces load.

Fix memory leaks rather than merely documenting them.

---

# 63. Final deliverables

When the build is complete, provide:

1. Summary of what was built.
2. Implemented routes.
3. Architecture overview.
4. Database schema summary.
5. Storage structure.
6. Provider abstraction explanation.
7. Mock generation instructions.
8. Real provider integration steps.
9. Editor-state architecture.
10. Export architecture.
11. Authentication setup.
12. Development setup commands.
13. Test commands.
14. Build command.
15. Known limitations.
16. Incomplete items.
17. Screenshots of major states when screenshot tooling is available.
18. Results of linting, type checking, tests, and production build.

Do not claim that a feature is complete unless it works.

Do not hide failed tests.

Do not silently remove requirements because they were difficult.

---

# 64. Final product standard

Meshlab V1 should feel like a focused creative instrument.

It should not feel like:

* A generic AI SaaS dashboard
* A template marketplace clone
* A Blender replacement
* A static design prototype
* A collection of rounded cards
* A demo with fake buttons
* A landing page attached to an unfinished editor

It should feel:

* Quiet
* Spacious
* Precise
* Responsive
* Trustworthy
* Creative
* Technically credible
* Friendly to beginners
* Useful to experienced creators

Preserve intentional blank space.

Let the model remain the visual focus.

Build the complete working V1, including the mock generation flow, editor, persistence, versioning, and export path.
