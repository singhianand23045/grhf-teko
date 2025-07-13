# Phase 8: Play Assistant — Requirements Document

## Overview

The Play Assistant is an interactive extension of the Number Assistant that enables users to receive number recommendations and directly confirm them for gameplay. This feature bridges the gap between AI analysis and actual game participation, creating a seamless experience from consultation to play.

## Core Feature Requirements

### Interactive Number Recommendations

**FR1: Visual Number Display**
- Assistant responses can display 6 numbers in a visual grid format
- Numbers should match the styling of the main number selection grid
- Each number appears as a clickable/selectable element

**FR2: Interactive Confirmation**
- "Confirm for This Draw" button below recommended number set
- Button state changes based on timer status and game availability
- Visual feedback when user hovers/interacts with the confirmation option

**FR3: Natural Language Interface**
- Users interact through normal chat conversation
- No explicit UI controls for recommendation types
- Assistant interprets natural language requests:
  - "Show me hot numbers" → Hot number recommendations
  - "Give me cold numbers" → Cold number recommendations
  - "I need lucky numbers" → Balanced set recommendations
  - "What numbers should I pick?" → Best available recommendation

**FR4: Timer-Aware Functionality**
- Assistant automatically checks current timer state before displaying confirmation options
- Dynamic button text and availability based on draw status:
  - OPEN: "Confirm for This Draw"
  - CUT_OFF/REVEAL: "Queue for Next Draw"
  - COMPLETE: "Confirm for Next Draw"

**FR5: Smart Queuing System**
- When current draw is locked, automatically offer to queue numbers for next draw
- Show clear messaging: "This draw is locked. I'll queue these for the next draw."
- Persist queued selections across timer cycles
- Auto-apply queued numbers when new draw opens with notification

**FR6: Game State Integration**

**FR7: Number Selection Integration**
- Seamlessly integrate with existing NumberSelectionContext
- Replace any existing user selections with assistant recommendations
- Direct confirmation without additional user approval required

**FR8: Confirmation Flow Integration**
- Assistant confirmation immediately confirms numbers for the current draw
- Bypass manual selection grid and proceed directly to ticket confirmation
- Maintain existing credit deduction and game mechanics

**FR9: Enhanced Assistant Capabilities**

**FR10: Rich Content Responses**
- Assistant can render interactive UI components in chat
- Support for custom number grid components within chat interface
- Action buttons that trigger game state changes
- Real-time status updates based on game state

**FR11: Intelligent Recommendation Processing**
- Parse natural language to determine recommendation type
- Access to real-time draw data for analysis
- Multiple recommendation strategies available:
  - Hot numbers (most frequent in recent draws)
  - Cold numbers (least frequent, "due" numbers)
  - Balanced sets (mix of high/low, even/odd)
  - Pattern-based recommendations
  - User history-based suggestions
- Default to best available strategy when request is ambiguous

## Technical Requirements

### Chat Interface Enhancements

**TR1: Component Rendering in Chat**
- Extend chat interface to support React components in messages
- Custom NumberRecommendationCard component
- Interactive buttons within chat messages
- State management for interactive chat elements

**TR2: Assistant Response Types**
- Define structured response types for different recommendation formats
- Support for multiple content types in single response
- Fallback to text-only when interactive elements aren't available

### State Management

**TR3: Recommendation State**
- Track active assistant recommendations
- Manage queued selections for future draws
- Store recommendation context and reasoning
- Clear state appropriately across draw cycles

**TR4: Timer State Access**
- Assistant functions need read access to timer state
- Real-time updates when timer state changes
- Notification system for state-dependent recommendations

### Data Integration

**TR5: Enhanced Context Data**
- Extend edge function context to include:
  - Current timer state and remaining time
  - User's current selected numbers
  - User's confirmation status
  - Available credits for play

**TR6: Recommendation Analytics**
- Track recommendation acceptance rates
- Monitor which recommendation types users prefer
- Analyze correlation between recommendations and user satisfaction

## User Experience Requirements

### Interaction Flows

**UX1: Natural Language Recommendation Flow**
1. User asks for recommendations in natural language: "Show me some hot numbers" or "What should I pick?"
2. Assistant interprets the request and determines appropriate recommendation type
3. Display 6 numbers with "Confirm for This Draw" button (or appropriate timer-based text)
4. User confirms → numbers are immediately confirmed for the draw
5. System proceeds directly to ticket confirmation and credit deduction

**UX2: Queued Recommendation Flow**
1. User requests recommendations during locked period
2. Assistant shows numbers with automatic queue messaging: "This draw is locked. I'll queue these for the next draw."
3. User confirms queuing through same confirmation button
4. System shows "Queued for next draw" status in chat
5. When new draw opens, auto-populate queued numbers with notification

**UX3: Existing Selection Replacement**
1. User has existing selections and asks assistant for help
2. Assistant shows recommended numbers with confirmation option
3. User confirms → system automatically replaces existing selections
4. Numbers are immediately confirmed for the draw
5. System proceeds to ticket confirmation

### Error Handling

**UX4: Insufficient Data Scenarios**
- When historical data is limited: suggest balanced selection with explanation
- When user has no credits: show recommendations but disable confirmation with clear message
- When system errors occur: graceful fallback to text-only recommendations

**UX5: Edge Case Management**
- Handle rapid timer state changes during interaction
- Manage concurrent user actions (manual selection + assistant recommendation)
- Deal with network delays in recommendation processing

## Implementation Phases

### Phase 8.1: Natural Language Processing
- Implement natural language interpretation for recommendation requests
- Parse common phrases and map to recommendation types
- Basic visual number display in chat with confirmation functionality

### Phase 8.2: Interactive Chat Components
- Add visual number grid component within chat interface
- Implement confirmation button with timer state awareness
- Integration with NumberSelectionContext

### Phase 8.3: Timer-Aware Queuing
- Add automatic timer state detection
- Implement queuing system for locked periods
- Enhanced messaging for different timer states

### Phase 8.4: Polish and Optimization
- Enhanced visual design for chat components
- Performance optimization for real-time updates
- Comprehensive error handling and edge cases


## Testing Requirements

**Functional Testing:**
- Verify recommendations appear correctly in all timer states
- Test queuing system across multiple draw cycles
- Validate integration with existing game mechanics

**User Testing:**
- Test discoverability of interactive features
- Validate intuitive flow from recommendation to play
- Assess user understanding of queuing system

**Performance Testing:**
- Measure response times for recommendation generation
- Test system behavior under concurrent recommendation requests
- Validate real-time timer state synchronization
