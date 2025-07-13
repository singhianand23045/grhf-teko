# Phase 8: Play Assistant — Requirements Document

## Overview

The Play Assistant is an interactive extension of the Number Assistant that enables users to receive number recommendations and directly confirm them for gameplay. This feature bridges the gap between AI analysis and actual game participation, creating a seamless experience from consultation to play.

## Core Feature Requirements

### Interactive Number Recommendations

**FR1: Visual Number Display**
- Assistant responses can display 6 numbers in a visual grid format
- Numbers should match the styling of the main number selection grid
- Each number appears as a clickable/selectable element
- Include visual indicators showing these are AI recommendations

**FR2: Contextual Reasoning Display**
- Show why these numbers were selected (e.g., "hot numbers from last 20 draws")
- Display frequency data or pattern information when available
- Include confidence indicators or statistical context

**FR3: Interactive Confirmation**
- "Confirm These Numbers" button below recommended number set
- Button state changes based on timer status and game availability
- Visual feedback when user hovers/interacts with the confirmation option

### Timer-Aware Functionality

**FR4: Real-Time Timer Integration**
- Assistant checks current timer state before displaying confirmation options
- Dynamic button text and availability based on draw status:
  - OPEN: "Confirm for This Draw"
  - CUT_OFF/REVEAL: "Queue for Next Draw"
  - COMPLETE: "Confirm for Next Draw"

**FR5: Smart Queuing System**
- When current draw is locked, offer to queue numbers for next draw
- Show clear messaging: "Numbers locked for this draw. Queue these for next draw?"
- Persist queued selections across timer cycles
- Auto-apply queued numbers when new draw opens

### Game State Integration

**FR6: Number Selection Integration**
- Seamlessly integrate with existing NumberSelectionContext
- Handle conflicts when user has partial selections:
  - Replace existing selections (with confirmation)
  - Merge with existing selections (avoid duplicates)
  - Cancel and keep current selections

**FR7: Confirmation Flow Integration**
- After assistant confirmation, numbers appear in main selection grid
- User can still modify selections before final game confirmation
- Maintain existing confirmation and credit deduction flow
- Show clear distinction between assistant-selected and user-modified numbers

### Enhanced Assistant Capabilities

**FR8: Rich Content Responses**
- Assistant can render interactive UI components in chat
- Support for custom number grid components within chat interface
- Action buttons that trigger game state changes
- Real-time status updates based on game state

**FR9: Recommendation Intelligence**
- Access to real-time draw data for analysis
- Multiple recommendation strategies:
  - Hot numbers (most frequent)
  - Cold numbers (least frequent)
  - Balanced sets (mix of hot/cold)
  - Pattern-based recommendations
  - User history-based suggestions

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

**UX1: Standard Recommendation Flow**
1. User asks for number recommendations
2. Assistant analyzes available data
3. Display 6 numbers with reasoning
4. Show appropriate confirmation option based on timer
5. User confirms → numbers auto-populate in game
6. User can modify and proceed with normal confirmation

**UX2: Queued Recommendation Flow**
1. User requests recommendations during locked period
2. Assistant shows numbers with queue option
3. User confirms queuing
4. System shows "queued for next draw" status
5. When new draw opens, auto-populate queued numbers
6. Notify user that queued numbers are now active

**UX3: Conflict Resolution Flow**
1. User has partial selections and requests assistant help
2. Assistant detects conflict and offers options:
   - "Replace your current selections with these 6 numbers?"
   - "Add these numbers to your existing selections?"
   - "Keep your selections and save these for later?"
3. User chooses preferred resolution
4. System applies changes accordingly

### Error Handling

**UX4: Insufficient Data Scenarios**
- When historical data is limited: suggest random selection with explanation
- When user has no credits: show recommendations but disable confirmation
- When system errors occur: graceful fallback to text-only recommendations

**UX5: Edge Case Management**
- Handle rapid timer state changes during interaction
- Manage concurrent user actions (manual selection + assistant recommendation)
- Deal with network delays in recommendation processing

## Implementation Phases

### Phase 8.1: Basic Interactive Recommendations
- Implement visual number display in chat
- Basic confirmation functionality for OPEN timer state
- Integration with NumberSelectionContext

### Phase 8.2: Timer-Aware Queuing
- Add timer state awareness
- Implement queuing system for locked periods
- Enhanced messaging for different timer states

### Phase 8.3: Advanced Features
- Conflict resolution for partial selections
- Multiple recommendation strategies
- Analytics and user preference tracking

### Phase 8.4: Polish and Optimization
- Enhanced visual design
- Performance optimization for real-time updates
- Comprehensive error handling and edge cases

## Success Metrics

**Engagement Metrics:**
- Percentage of users who request number recommendations
- Recommendation acceptance rate
- Time from recommendation to play confirmation

**User Experience Metrics:**
- Reduction in time from consultation to play
- User satisfaction with recommended numbers
- Frequency of assistant-driven gameplay

**Technical Metrics:**
- Response time for interactive recommendations
- System reliability during timer state transitions
- Error rates in recommendation-to-play flow

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

## Future Considerations

**Advanced AI Features:**
- Machine learning-based recommendation improvement
- Personalized recommendation strategies
- Predictive queuing based on user patterns

**Social Features:**
- Share assistant recommendations with other players
- Community voting on recommendation strategies
- Leaderboards for assistant-recommended plays

**Integration Opportunities:**
- Connect with external lottery analysis services
- Integration with user's personal lucky numbers
- Automated play scheduling based on assistant analysis