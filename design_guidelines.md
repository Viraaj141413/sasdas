# QA Reminder App - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing from Linear and Asana's clean, productivity-focused interfaces with Material Design principles for forms and data display. The design prioritizes efficiency, clarity, and quick task completion for QA professionals managing testing schedules.

## Core Design Elements

### Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Headings**: Font weight 600, sizes: text-2xl (page titles), text-xl (section headers), text-lg (card titles)
- **Body Text**: Font weight 400, text-base for forms and descriptions
- **Labels**: Font weight 500, text-sm for form labels and metadata
- **Timestamps/Secondary**: Font weight 400, text-sm for dates and status indicators

### Layout System
**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, and 12 consistently
- Component padding: p-6
- Section gaps: gap-4, gap-6
- Card spacing: p-4 to p-6
- Form field spacing: space-y-4
- List item padding: px-4 py-3

**Container Strategy**:
- Main app container: max-w-6xl mx-auto with px-4
- Form containers: max-w-2xl for optimal form completion
- Reminder lists: Full width within container with proper gutters

### Component Library

#### Navigation
- **Top App Bar**: Fixed header with app title, quick stats (e.g., "5 Active Reminders"), and primary "New Reminder" action button
- **Tab Navigation**: For switching between "Active," "Scheduled," and "Completed" reminder views
- Height: h-16 for top bar

#### Forms (Critical Component)
**Create/Edit Reminder Form**:
- Title input: Large, prominent text-lg input field
- Description textarea: min-h-32 for detailed QA notes
- Phone number input: With Twilio-compatible formatting hint
- Date picker: Native HTML5 date input with clear visual treatment
- Time picker: Native HTML5 time input
- Submit button: Prominent, full-width on mobile (sm:w-auto on desktop)
- Form layout: Single column, stacked fields with consistent space-y-4

#### Data Display
**Reminder Cards**:
- Card structure: Rounded borders (rounded-lg), subtle border treatment
- Header: Reminder title (text-lg font-semibold) with status badge
- Body: Description text (text-sm), phone number, scheduled date/time
- Footer: Action buttons (Complete, Edit, Delete) aligned to right
- Spacing: p-4 internal padding, gap-3 between cards in list

**Status Badges**:
- Upcoming: Distinct visual treatment
- Overdue: Alert styling
- Completed: Muted treatment
- Badge sizes: px-3 py-1, text-xs font-medium, rounded-full

#### Lists
- Reminder list: Vertical stack with gap-3
- Empty state: Centered message with icon placeholder and "Create First Reminder" CTA
- List items: Clear visual separation, hover state for interactivity

#### Buttons & Actions
**Primary Actions**: "Create Reminder," "Send Now," "Save"
**Secondary Actions**: "Edit," "Mark Complete"
**Destructive Actions**: "Delete" with confirmation
- Button padding: px-4 py-2 (standard), px-6 py-3 (large CTAs)
- Icon + text combinations for clarity

#### Overlays
**Modal Dialogs**:
- Delete confirmation: Simple centered modal, max-w-md
- Edit reminder: Same form as create, in modal or dedicated view
- Success notifications: Toast-style, top-right positioning
- Modal backdrop: Semi-transparent overlay

### Animations
Use sparingly and purposefully:
- Form validation: Subtle shake animation for errors
- Toast notifications: Slide-in from top-right
- List updates: Smooth height transitions when items are added/removed
- NO decorative animations, focus on functional feedback

### Layout Structure

**Main Dashboard**:
- Header: App title + stats + primary CTA
- Filter/Tab bar: Active/Scheduled/Completed views
- Main content area: Reminder list with cards
- FAB (optional): Fixed "+" button on mobile for quick reminder creation

**Reminder Creation View**:
- Breadcrumb/back navigation
- Form title: "New QA Reminder"
- Full form with all fields
- Bottom action bar: Cancel + Create buttons

**Reminder Detail/Edit**:
- Similar to creation form but pre-populated
- Additional metadata: Created date, last modified, sent status
- Prominent status indicator

### Mobile Optimization
- Stack all elements vertically on mobile
- Full-width buttons below sm breakpoint
- Bottom sheet for quick actions on mobile
- Touch-friendly tap targets: min-h-12 for buttons
- Fixed bottom action bar for primary actions on mobile

### Icons
**Library**: Heroicons (via CDN)
**Usage**:
- Bell icon: Reminder/notification indicator
- Calendar icon: Date/time fields
- Phone icon: SMS/phone number fields
- Check circle: Completion status
- Trash icon: Delete action
- Pencil: Edit action
- Plus: Create new reminder

### Accessibility
- Form labels: Explicitly associated with inputs using for/id
- Error messages: Announced by screen readers, visible below fields
- Focus indicators: Visible focus rings on all interactive elements
- Button states: Clear visual feedback for hover, active, disabled
- Semantic HTML: Proper heading hierarchy, button vs link usage

### Key Principles
1. **Efficiency First**: Minimal clicks to create and manage reminders
2. **Clear Hierarchy**: Important information (date, status) immediately visible
3. **Consistent Patterns**: Reuse form patterns, button styles, and spacing throughout
4. **Feedback**: Clear confirmation of all actions (sent, deleted, completed)
5. **Responsive**: Fully functional on mobile devices for on-the-go QA teams