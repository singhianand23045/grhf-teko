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
- Transparent confirmation button with timer-aware text below recommended number set
- Button text clearly indicates action: "Confirm Numbers" vs "Queue for Next Draw"
- Button behavior changes based on timer status while maintaining clear user expectations
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
- Transparent button text clearly indicates what action will be taken:
  - OPEN: "Confirm Numbers" (immediate confirmation)
  - CUT_OFF/REVEAL/COMPLETE: "Queue for Next Draw" (queued for future)
- User always knows exactly what will happen when they click

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
- CRITICAL: Numbers must ONLY be from 1-27 range (never outside game constraints)
- Multiple recommendation strategies available:
  - Hot numbers (most frequent in recent draws)
  - Cold numbers (least frequent, "due" numbers)  
  - Balanced sets (mix of high/low, even/odd)
  - Pattern-based recommendations
  - User history-based suggestions
- Default to best available strategy when request is ambiguous
- **Tone Requirements**: Use fun, encouraging language following Phase 7 guidelines:
  - NO academic explanations or "theory" language
  - NO phrases like "Hot numbers theory suggests" or educational disclaimers
  - Use casual, exciting language: "These numbers are on fire!" or "These are totally due!"
  - Focus on excitement and encouragement rather than education

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

**UX1: Clean Chat Experience**
- **No Visual Distractions**: Users don't see timer states, cycle information, or technical status
- **Pure Chat Interface**: Focus entirely on natural conversation and number recommendations
- **Hidden Complexity**: All draw status management happens seamlessly in the background
- **Fun-First Design**: Interface emphasizes the enjoyment and excitement of getting recommendations

**UX2: Natural Language Recommendation Flow**
1. User asks for recommendations in natural language: "Show me some hot numbers" or "What should I pick?"
2. Assistant interprets the request and determines appropriate recommendation type
3. Display 6 numbers with transparent action button ("Confirm Numbers" or "Queue for Next Draw")
4. User confirms → numbers are immediately processed based on clearly indicated action
5. System handles timing logic with full user awareness of what action was taken

**UX3: Seamless Background Processing**
- Timer state awareness happens behind the scenes
- Automatic queuing when draws are locked (user doesn't need to know)
- Silent state management for optimal user experience
- Recommendations flow naturally without technical interruptions

### Error Handling

**UX4: Game Constraint Compliance**
- CRITICAL: All recommended numbers must be within 1-27 range
- Validate number generation to prevent out-of-range recommendations
- System should never suggest numbers like 89, 45, 73, etc.

**UX5: Messaging Tone Requirements**
- Follow Phase 7 LLM prompt guidelines for encouraging, fun tone
- FORBIDDEN: Academic language, theory explanations, educational disclaimers
- REQUIRED: Casual, exciting language that builds anticipation
- Examples: "These numbers are on fire!" vs "Hot numbers theory suggests..."

**UX6: Technical Error Scenarios**
- When historical data is limited: suggest balanced selection with encouraging message
- When user has no credits: show recommendations but disable confirmation with clear message  
- When system errors occur: graceful fallback to text-only recommendations with positive tone

**UX7: Edge Case Management**
- Handle rapid timer state changes during interaction
- Manage concurrent user actions (manual selection + assistant recommendation)
- Deal with network delays in recommendation processing

## Implementation Phases

### Phase 8.1: Natural Language Processing & Constraint Compliance
- Implement natural language interpretation for recommendation requests
- CRITICAL: Ensure all number generation respects 1-27 game constraints
- Parse common phrases and map to recommendation types
- Implement fun, encouraging messaging following Phase 7 tone guidelines
- Basic visual number display in chat with confirmation functionality

### Phase 8.2: Interactive Chat Components
- Add visual number grid component within chat interface
- Implement confirmation button with simplified messaging (no technical timer details)
- Integration with NumberSelectionContext
- Remove academic/lecturing language from all user-facing text

### Phase 8.3: Background Timer-Aware Processing
- Add automatic timer state detection (hidden from user)
- Implement queuing system for locked periods (seamless background processing)
- Enhanced messaging with encouraging, fun tone throughout

### Phase 8.4: Polish and User Experience Optimization
- Enhanced visual design for chat components
- Performance optimization for real-time updates  
- Comprehensive error handling with positive, encouraging messaging
- Final review to ensure no academic language or out-of-range numbers


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
