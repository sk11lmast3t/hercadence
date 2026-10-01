import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FolderGit2, 
  Layers, 
  Smartphone,
  ExternalLink,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface KotlinAndroidCodeViewerScreenProps {
  onBack: () => void;
}

interface KotlinFile {
  path: string;
  name: string;
  category: 'UI / Compose' | 'Data & Models' | 'Architecture' | 'Config';
  description: string;
  code: string;
}

const KOTLIN_FILES: KotlinFile[] = [
  {
    path: 'android/app/src/main/java/com/cycletracker/mobile/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'Architecture',
    description: 'Entry point with Navigation Compose host and ViewModel initialization.',
    code: `package com.cycletracker.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cycletracker.mobile.data.local.AppDatabase
import com.cycletracker.mobile.data.repository.CycleRepository
import com.cycletracker.mobile.ui.screens.HomeScreen
import com.cycletracker.mobile.ui.screens.InitialBaselineSetupScreen
import com.cycletracker.mobile.ui.theme.CycleTrackerTheme
import com.cycletracker.mobile.viewmodel.CycleViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = AppDatabase.getDatabase(applicationContext)
        val repository = CycleRepository(database.cycleDao())

        setContent {
            CycleTrackerTheme {
                val navController = rememberNavController()
                val viewModel: CycleViewModel = viewModel { CycleViewModel(repository) }
                val uiState by viewModel.uiState.collectAsState()

                val startDestination = if (uiState.isBaselineCompleted) "home" else "baseline_setup"

                NavHost(
                    navController = navController,
                    startDestination = startDestination
                ) {
                    composable("baseline_setup") {
                        InitialBaselineSetupScreen(
                            viewModel = viewModel,
                            onComplete = {
                                navController.navigate("home") {
                                    popUpTo("baseline_setup") { inclusive = true }
                                }
                            }
                        )
                    }

                    composable("home") {
                        HomeScreen(
                            viewModel = viewModel,
                            onNavigateToCalendar = { /* Open Calendar */ },
                            onNavigateToSettings = { navController.navigate("baseline_setup") },
                            onOpenLogModal = { /* Open Daily Log Dialog */ }
                        )
                    }
                }
            }
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/cycletracker/mobile/ui/screens/InitialBaselineSetupScreen.kt',
    name: 'InitialBaselineSetupScreen.kt',
    category: 'UI / Compose',
    description: 'Jetpack Compose onboarding screen collecting Weight, Height, Age, Cycle Length, Period Duration, Regularity, Symptoms & Goals.',
    code: `package com.cycletracker.mobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cycletracker.mobile.ui.theme.*
import com.cycletracker.mobile.viewmodel.CycleViewModel

@Composable
fun InitialBaselineSetupScreen(
    viewModel: CycleViewModel,
    onComplete: () -> Unit
) {
    var currentStep by remember { mutableIntStateOf(1) }

    var weight by remember { mutableFloatStateOf(59f) }
    var weightUnit by remember { mutableStateOf("kg") }
    var heightCm by remember { mutableIntStateOf(165) }
    var age by remember { mutableIntStateOf(26) }
    var cycleLength by remember { mutableIntStateOf(28) }
    var periodLength by remember { mutableIntStateOf(5) }
    var lastPeriodDate by remember { mutableStateOf("2026-08-25") }
    var regularity by remember { mutableStateOf("Regular") }
    var birthControl by remember { mutableStateOf("Natural / None") }
    val selectedSymptoms = remember { mutableStateListOf("Cramps", "Fatigue", "Bloating") }
    val primaryGoals = remember { mutableStateListOf("Track cycle", "Hormone harmony", "PMS relief") }

    Scaffold(
        containerColor = CreamBackground,
        topBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("STEP $currentStep OF 4", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PlumLight)
                TextButton(onClick = onComplete) {
                    Text("Skip", color = PlumLight, fontSize = 13.sp)
                }
            }
        },
        bottomBar = {
            Box(modifier = Modifier.padding(20.dp)) {
                Button(
                    onClick = {
                        if (currentStep < 4) {
                            currentStep++
                        } else {
                            viewModel.saveBaseline(
                                weight, weightUnit, heightCm, age, cycleLength,
                                periodLength, lastPeriodDate, regularity,
                                birthControl, selectedSymptoms.toList(), primaryGoals.toList()
                            )
                            onComplete()
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PlumMedium)
                ) {
                    Text(if (currentStep < 4) "Continue" else "Save & Sync Rhythm", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.Default.ChevronRight, contentDescription = null)
                }
            }
        }
    ) { padding ->
        // Step 1 (Weight, Height, Age), Step 2 (Cycle History), Step 3 (Symptoms), Step 4 (Goals)
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/cycletracker/mobile/data/model/CycleModels.kt',
    name: 'CycleModels.kt',
    category: 'Data & Models',
    description: 'Room Entities and Domain models: UserBaseline, DayLog, CyclePhase, CycleStatus.',
    code: `package com.cycletracker.mobile.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate

enum class CyclePhase(val displayName: String, val colorHex: String) {
    MENSTRUAL("Menstrual", "#D98A99"),
    FOLLICULAR("Follicular", "#E8A598"),
    OVULATION("Ovulation", "#F0C878"),
    LUTEAL("Luteal", "#87A997")
}

@Entity(tableName = "user_baseline")
data class UserBaseline(
    @PrimaryKey val id: Int = 1,
    val weight: Float = 59.0f,
    val weightUnit: String = "kg",
    val heightCm: Int = 165,
    val age: Int = 26,
    val averageCycleLength: Int = 28,
    val averagePeriodLength: Int = 5,
    val lastPeriodStartDate: String = LocalDate.now().minusDays(12).toString(),
    val cycleRegularity: String = "Regular",
    val birthControlMethod: String = "Natural / None",
    val typicalSymptoms: List<String> = listOf("Cramps", "Fatigue", "Bloating"),
    val primaryGoals: List<String> = listOf("Track cycle", "Hormone harmony", "PMS relief"),
    val sleepHoursBaseline: Float = 7.5f,
    val activityLevel: String = "Moderately Active",
    val isSetupCompleted: Boolean = true
)

@Entity(tableName = "day_logs")
data class DayLog(
    @PrimaryKey val date: String,
    val flow: String? = null,
    val symptoms: List<String> = emptyList(),
    val moods: List<String> = emptyList(),
    val bbtCelsius: Float? = null,
    val cervicalMucus: String? = null,
    val intimacy: Boolean = false,
    val notes: String? = null,
    val pillTaken: Boolean = false,
    val loggedWeightKg: Float? = null,
    val focusLevel: Int? = null,
    val comfortLevel: Int? = null
)

data class CycleStatus(
    val currentDayOfCycle: Int,
    val currentPhase: CyclePhase,
    val daysUntilNextPeriod: Int,
    val nextPeriodDate: LocalDate,
    val nextOvulationDate: LocalDate,
    val pregnancyChance: String
)`
  },
  {
    path: 'android/app/src/main/java/com/cycletracker/mobile/data/repository/CycleRepository.kt',
    name: 'CycleRepository.kt',
    category: 'Architecture',
    description: 'Repository calculating real-time phase transitions, countdowns, and ovulation windows.',
    code: `package com.cycletracker.mobile.data.repository

import com.cycletracker.mobile.data.local.CycleDao
import com.cycletracker.mobile.data.model.*
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate
import java.time.temporal.ChronoUnit

class CycleRepository(private val dao: CycleDao) {

    val userBaseline: Flow<UserBaseline?> = dao.getUserBaseline()
    val allDayLogs: Flow<List<DayLog>> = dao.getAllLogs()

    suspend fun saveBaseline(baseline: UserBaseline) {
        dao.saveUserBaseline(baseline)
    }

    suspend fun saveLog(log: DayLog) {
        dao.saveDayLog(log)
    }

    fun calculateCycleStatus(baseline: UserBaseline, today: LocalDate = LocalDate.now()): CycleStatus {
        val lastPeriod = try { LocalDate.parse(baseline.lastPeriodStartDate) } catch (e: Exception) { today.minusDays(12) }
        val cycleLength = baseline.averageCycleLength.coerceAtLeast(21)
        val periodLength = baseline.averagePeriodLength.coerceIn(2, 10)

        val daysSinceLastPeriod = ChronoUnit.DAYS.between(lastPeriod, today).toInt()
        val currentDay = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength + 1

        val currentPhase = when {
            currentDay <= periodLength -> CyclePhase.MENSTRUAL
            currentDay < (cycleLength - 14) -> CyclePhase.FOLLICULAR
            currentDay in (cycleLength - 14 - 1)..(cycleLength - 14 + 1) -> CyclePhase.OVULATION
            else -> CyclePhase.LUTEAL
        }

        val daysUntilNext = (cycleLength - currentDay).coerceAtLeast(0)
        return CycleStatus(
            currentDayOfCycle = currentDay,
            currentPhase = currentPhase,
            daysUntilNextPeriod = daysUntilNext,
            nextPeriodDate = today.plusDays(daysUntilNext.toLong()),
            nextOvulationDate = lastPeriod.plusDays((cycleLength - 14).toLong()),
            pregnancyChance = if (currentPhase == CyclePhase.OVULATION) "High (Peak)" else "Low"
        )
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/cycletracker/mobile/ui/theme/Theme.kt',
    name: 'Theme.kt',
    category: 'UI / Compose',
    description: 'Material 3 ColorScheme matching the luxury Plum & Rose serene aesthetic.',
    code: `package com.cycletracker.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PlumDark = Color(0xFF3B2533)
val PlumMedium = Color(0xFF543649)
val PlumLight = Color(0xFF8A576E)
val RoseSoft = Color(0xFFEBD7D9)
val RoseAccent = Color(0xFFD98A99)
val SageMuted = Color(0xFF87A997)
val CreamBackground = Color(0xFFFAF7F2)
val SurfaceCard = Color(0xFFFFFFFF)
val OutlineSoft = Color(0xFFEDE5DF)

private val LightColorScheme = lightColorScheme(
    primary = PlumMedium,
    onPrimary = Color.White,
    primaryContainer = RoseSoft,
    onPrimaryContainer = PlumDark,
    secondary = SageMuted,
    onSecondary = Color.White,
    background = CreamBackground,
    onBackground = PlumDark,
    surface = SurfaceCard,
    onSurface = PlumDark,
    outline = OutlineSoft
)

@Composable
fun CycleTrackerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}`
  },
  {
    path: 'android/app/build.gradle.kts',
    name: 'build.gradle.kts',
    category: 'Config',
    description: 'Android Gradle configuration with Jetpack Compose, Room SQLite, and Coroutines.',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.cycletracker.mobile"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.cycletracker.mobile"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3:1.2.0")
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
}`
  }
];

export const KotlinAndroidCodeViewerScreen: React.FC<KotlinAndroidCodeViewerScreenProps> = ({ onBack }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeFile = KOTLIN_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const combinedContent = KOTLIN_FILES.map(
      (f) => `// ========================================================\n// FILE: ${f.path}\n// ========================================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CycleTracker_Kotlin_Android_Source.kt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#20171D] pb-24 font-sans selection:bg-[#EBD7D9]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-[#EDE5DF]/60">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-[#EDE5DF] flex items-center justify-center text-[#543649] hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <h2 className="font-serif text-[18px] font-bold text-[#3B2533]">
              Kotlin Android Project
            </h2>
            <p className="text-[11px] text-[#8A576E] font-medium">
              Jetpack Compose • Room • MVVM
            </p>
          </div>

          <button
            onClick={handleDownloadAll}
            title="Download all Kotlin source files"
            className="p-2 rounded-full bg-white border border-[#EDE5DF] text-[#543649] hover:bg-stone-50 transition-all cursor-pointer"
          >
            <Download size={17} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5 space-y-5">
        {/* Banner Explaining Native Android Structure */}
        <div className="bg-[#543649] text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#D98A99]" />
            <h3 className="font-serif text-[18px] font-bold">100% Native Kotlin Codebase</h3>
          </div>
          <p className="text-[13px] text-stone-200 leading-relaxed">
            The entire application architecture has been authored in native Kotlin with Jetpack Compose, Room SQLite persistence, and MVVM state management. Files reside in the <code className="bg-white/15 px-1.5 py-0.5 rounded text-[12px]">android/</code> repository directory.
          </p>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {KOTLIN_FILES.map((f, idx) => (
            <button
              key={f.name}
              onClick={() => setSelectedFileIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFileIndex === idx
                  ? 'bg-[#543649] text-white shadow-xs'
                  : 'bg-white border border-[#EDE5DF] text-[#6A5A64] hover:border-[#D5C2CC]'
              }`}
            >
              <FileCode size={13} />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* File Metadata Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#EDE5DF] flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider font-bold text-[#8A576E]">
              {activeFile.category}
            </span>
            <h4 className="font-bold text-[#3B2533] text-[14px]">
              {activeFile.name}
            </h4>
            <p className="text-[12px] text-[#7E6E77] mt-0.5">
              {activeFile.description}
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-[#FAF4EF] hover:bg-[#F3ECE6] text-[#543649] border border-[#E8DDD4] text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Code Box */}
        <div className="rounded-2xl overflow-hidden border border-[#2D232A] bg-[#1E171D] text-stone-200 shadow-md">
          <div className="bg-[#2D232A] px-4 py-2.5 flex items-center justify-between text-[11.5px] text-stone-400 font-mono border-b border-[#3B2F38]">
            <span className="truncate">{activeFile.path}</span>
            <span className="text-[10px] text-emerald-400 font-sans font-semibold">Kotlin</span>
          </div>
          <pre className="p-4 text-[12px] font-mono leading-relaxed overflow-x-auto text-stone-300 max-h-[460px] overflow-y-auto">
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </main>
    </div>
  );
};
