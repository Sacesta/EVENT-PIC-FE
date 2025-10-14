# Date/Time Field Implementation TODO

## Task: Replace single Date field with Start Date, End Date, Start Time, End Time

### Phase 1: Update Type Definitions ✅
- [x] Update EventData interface in types.ts

### Phase 2: Create New DateTimeSelector Component ✅
- [x] Update DateTimeSelector.tsx to support 4 fields
- [x] Add validation for end date/time after start date/time
- [x] Update props and handlers

### Phase 3: Update Step2_Details Component
- [ ] Replace single date/time state with four separate states
- [ ] Update handleUpdate callback
- [ ] Update validation logic
- [ ] Update DateTimeSelector usage

### Phase 4: Update EditEventModal Component
- [ ] Update state management for four date/time fields
- [ ] Update data loading logic
- [ ] Update handleInputChange
- [ ] Update API submission logic

### Phase 5: Update Step3_Summary Component
- [ ] Update display logic
- [ ] Update transformEventData function
- [ ] Ensure proper ISO string creation

### Phase 6: Update Translation Files
- [ ] Add new translation keys

### Phase 7: Testing & Validation
- [ ] Test create event flow
- [ ] Test edit event flow
- [ ] Verify API calls
- [ ] Test validation

## Progress: Starting Phase 1
