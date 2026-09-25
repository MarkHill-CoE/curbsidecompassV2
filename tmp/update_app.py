with open('src/App.tsx', 'r') as f:
    app_code = f.read()

# 1. Import ManualSlidersDrawer
old_import = "import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';"
new_import = """import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { ManualSlidersDrawer } from './components/ManualSlidersDrawer';"""

assert old_import in app_code, 'old_import not found'
app_code = app_code.replace(old_import, new_import, 1)

# 2. Add state for showManualSliders and simulationMetrics
old_state_anchor = "  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);"
new_state_anchor = """  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [showManualSliders, setShowManualSliders] = useState<boolean>(false);
  const [simulationMetrics, setSimulationMetrics] = useState<{
    activeHouseholdCars: number;
    activeVisitorCars: number;
    totalDwellings: number;
    totalWeeklyDeliveries: number;
    circlingCarCount: number;
    onReshuffle: () => void;
  }>({
    activeHouseholdCars: 15,
    activeVisitorCars: 3,
    totalDwellings: 6,
    totalWeeklyDeliveries: 12,
    circlingCarCount: 0,
    onReshuffle: () => {}
  });"""

assert old_state_anchor in app_code, 'old_state_anchor not found'
app_code = app_code.replace(old_state_anchor, new_state_anchor, 1)

# 3. Update NeighborhoodSimulation component call
old_sim_call = """          <NeighborhoodSimulation
            config={simConfig}
            onConfigChange={handleConfigChange}
            activeQuestionNumber={currentStep + 1}
            policyNote={policyNote}
            isCompleted={isCompleted}
          />"""

new_sim_call = """          <NeighborhoodSimulation
            config={simConfig}
            onConfigChange={handleConfigChange}
            activeQuestionNumber={currentStep + 1}
            policyNote={policyNote}
            isCompleted={isCompleted}
            showControls={showManualSliders}
            onToggleControls={() => setShowManualSliders((prev) => !prev)}
            onSimulationMetricsChange={setSimulationMetrics}
          />"""

assert old_sim_call in app_code, 'old_sim_call not found'
app_code = app_code.replace(old_sim_call, new_sim_call, 1)

# 4. Wrap survey section with relative positioning, insert ManualSlidersDrawer, and blur the question container below
old_survey_section = """        {/* Interactive Survey or Results View */}
        <section
          id="survey-section"
          className={`w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full lg:w-[52%] xl:w-[50%] 2xl:w-[48%]" : "lg:w-[52%] xl:w-[50%] 2xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}
          aria-label="Parking Policy Persona Survey"
        >"""

new_survey_section = """        {/* Interactive Survey or Results View */}
        <section
          id="survey-section"
          className={`relative w-full flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-0 bg-[#ffffff] lg:h-full [@media(orientation:landscape)_and_(max-height:540px)]:h-full ${isCompleted ? "w-full lg:w-[52%] xl:w-[50%] 2xl:w-[48%]" : "lg:w-[52%] xl:w-[50%] 2xl:w-[48%] [@media(orientation:landscape)_and_(max-height:540px)]:w-1/2"}`}
          aria-label="Parking Policy Persona Survey"
        >
          {/* Manual Sliders Overlay: positioned over the question container, blurring question content underneath while the neighborhood canvas remains crisp and unblurred */}
          <ManualSlidersDrawer
            showControls={showManualSliders}
            onClose={() => setShowManualSliders(false)}
            config={simConfig}
            onConfigChange={handleConfigChange}
            activeHouseholdCars={simulationMetrics.activeHouseholdCars}
            activeVisitorCars={simulationMetrics.activeVisitorCars}
            totalDwellings={simulationMetrics.totalDwellings}
            totalWeeklyDeliveries={simulationMetrics.totalWeeklyDeliveries}
            circlingCarCount={simulationMetrics.circlingCarCount}
            onReshuffle={simulationMetrics.onReshuffle}
          />
          <div className={`w-full flex-1 flex flex-col justify-between min-h-0 transition-all duration-200 ${showManualSliders ? 'blur-sm select-none pointer-events-none' : ''}`}>"""

assert old_survey_section in app_code, 'old_survey_section not found'
app_code = app_code.replace(old_survey_section, new_survey_section, 1)

old_survey_end = """              onRetake={handleRetake}
            />
          )}
        </section>"""

new_survey_end = """              onRetake={handleRetake}
            />
          )}
          </div>
        </section>"""

assert old_survey_end in app_code, 'old_survey_end not found'
app_code = app_code.replace(old_survey_end, new_survey_end, 1)

with open('src/App.tsx', 'w') as f:
    f.write(app_code)

print('App.tsx successfully updated!')
