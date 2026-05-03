import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';

const Insights = () => {
  const [data, setData] = useState({
    weight: [],
    mood: [],
    meditation: [],
    journal: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [weight, mood, meditation, journal] = await Promise.all([
        api.get('physical/weight/'),
        api.get('mental/mood/'),
        api.get('mental/meditation/'),
        api.get('mental/journal/'),
      ]);

      setData({
        weight: weight.data,
        mood: mood.data,
        meditation: meditation.data,
        journal: journal.data,
      });
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load insights data');
      setLoading(false);
    }
  };

  // Calculate combined timeline data
  const getCombinedTimelineData = () => {
    const allDates = new Set([
      ...data.weight.map(e => e.date),
      ...data.mood.map(e => e.date),
    ]);

    return Array.from(allDates).sort().map(date => {
      const weightEntry = data.weight.find(e => e.date === date);
      const moodEntry = data.mood.find(e => e.date === date);

      return {
        date,
        weight: weightEntry?.weight || null,
        mood: moodEntry?.overall_mood || null,
        stress: moodEntry?.stress_level || null,
        anxiety: moodEntry?.anxiety_level || null,
      };
    });
  };

  // Calculate calorie-mood correlation
  const getCalorieMoodData = () => {
    return data.weight.map(entry => {
      const moodEntry = data.mood.find(m => m.date === entry.date);
      if (!moodEntry) return null;

      return {
        date: entry.date,
        calories: entry.calorie_intake,
        mood: moodEntry.overall_mood,
        stress: moodEntry.stress_level,
      };
    }).filter(Boolean);
  };

  // Calculate meditation impact
  const getMeditationImpact = () => {
    const daysWithMeditation = new Set(data.meditation.map(m => m.date));
    
    const moodWithMeditation = [];
    const moodWithoutMeditation = [];

    data.mood.forEach(mood => {
      if (daysWithMeditation.has(mood.date)) {
        moodWithMeditation.push(mood);
      } else {
        moodWithoutMeditation.push(mood);
      }
    });

    const avgWithMeditation = moodWithMeditation.length > 0
      ? {
          mood: (moodWithMeditation.reduce((sum, m) => sum + m.overall_mood, 0) / moodWithMeditation.length).toFixed(1),
          stress: (moodWithMeditation.reduce((sum, m) => sum + m.stress_level, 0) / moodWithMeditation.length).toFixed(1),
          anxiety: (moodWithMeditation.reduce((sum, m) => sum + m.anxiety_level, 0) / moodWithMeditation.length).toFixed(1),
        }
      : null;

    const avgWithoutMeditation = moodWithoutMeditation.length > 0
      ? {
          mood: (moodWithoutMeditation.reduce((sum, m) => sum + m.overall_mood, 0) / moodWithoutMeditation.length).toFixed(1),
          stress: (moodWithoutMeditation.reduce((sum, m) => sum + m.stress_level, 0) / moodWithoutMeditation.length).toFixed(1),
          anxiety: (moodWithoutMeditation.reduce((sum, m) => sum + m.anxiety_level, 0) / moodWithoutMeditation.length).toFixed(1),
        }
      : null;

    return { avgWithMeditation, avgWithoutMeditation };
  };

  // Calculate journal impact
  const getJournalImpact = () => {
    const daysWithJournal = new Set(data.journal.map(j => j.date));
    
    const moodWithJournal = [];
    const moodWithoutJournal = [];

    data.mood.forEach(mood => {
      if (daysWithJournal.has(mood.date)) {
        moodWithJournal.push(mood);
      } else {
        moodWithoutJournal.push(mood);
      }
    });

    const avgWithJournal = moodWithJournal.length > 0
      ? (moodWithJournal.reduce((sum, m) => sum + m.overall_mood, 0) / moodWithJournal.length).toFixed(1)
      : null;

    const avgWithoutJournal = moodWithoutJournal.length > 0
      ? (moodWithoutJournal.reduce((sum, m) => sum + m.overall_mood, 0) / moodWithoutJournal.length).toFixed(1)
      : null;

    return { avgWithJournal, avgWithoutJournal };
  };

  // Detect patterns
  const detectPatterns = () => {
    const patterns = [];
    const calorieMoodData = getCalorieMoodData();

    if (calorieMoodData.length >= 5) {
      // Check if high stress correlates with high calories
      const highStressDays = calorieMoodData.filter(d => d.stress >= 7);
      const lowStressDays = calorieMoodData.filter(d => d.stress <= 4);

      if (highStressDays.length >= 3 && lowStressDays.length >= 3) {
        const avgCaloriesHighStress = highStressDays.reduce((sum, d) => sum + d.calories, 0) / highStressDays.length;
        const avgCaloriesLowStress = lowStressDays.reduce((sum, d) => sum + d.calories, 0) / lowStressDays.length;
        const diff = avgCaloriesHighStress - avgCaloriesLowStress;

        if (Math.abs(diff) > 200) {
          patterns.push({
            icon: diff > 0 ? '😰' : '😌',
            title: diff > 0 ? 'Stress Eating Pattern Detected' : 'Healthy Stress Response',
            description: diff > 0
              ? `On high-stress days (7+), you consume ${Math.round(diff)} more calories on average than low-stress days.`
              : `On high-stress days, you maintain healthy eating habits with ${Math.abs(Math.round(diff))} fewer calories than low-stress days.`,
          });
        }
      }
    }

    // Check meditation impact
    const { avgWithMeditation, avgWithoutMeditation } = getMeditationImpact();
    if (avgWithMeditation && avgWithoutMeditation) {
      const stressReduction = avgWithoutMeditation.stress - avgWithMeditation.stress;
      
      if (stressReduction > 1) {
        patterns.push({
          icon: '🧘',
          title: 'Meditation Reduces Stress',
          description: `On days you meditate, your stress level is ${stressReduction.toFixed(1)} points lower on average.`,
        });
      }
    }

    // Check weight-mood correlation
    const timelineData = getCombinedTimelineData().filter(d => d.weight && d.mood);
    if (timelineData.length >= 7) {
      const recentWeek = timelineData.slice(-7);
      const avgMood = recentWeek.reduce((sum, d) => sum + d.mood, 0) / recentWeek.length;
      const weightChange = recentWeek[recentWeek.length - 1].weight - recentWeek[0].weight;

      if (avgMood >= 4 && weightChange < -0.5) {
        patterns.push({
          icon: '📉',
          title: 'Positive Mood Supports Weight Loss',
          description: `This week with an average mood of ${avgMood.toFixed(1)}/5, you've lost ${Math.abs(weightChange).toFixed(1)}kg.`,
        });
      }
    }

    return patterns;
  };

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    const { avgWithMeditation, avgWithoutMeditation } = getMeditationImpact();

    // Recommend meditation if it helps
    if (avgWithMeditation && avgWithoutMeditation) {
      const stressReduction = avgWithoutMeditation.stress - avgWithMeditation.stress;
      if (stressReduction > 1 && data.meditation.length < data.mood.length * 0.5) {
        recommendations.push({
          icon: '🧘',
          title: 'Meditate More Often',
          description: `Meditation reduces your stress by ${stressReduction.toFixed(1)} points. Try to meditate at least 4-5 days per week.`,
        });
      }
    }

    // Recommend journaling if user doesn't do it often
    const { avgWithJournal, avgWithoutJournal } = getJournalImpact();
    if (avgWithJournal && avgWithoutJournal) {
      const moodImprovement = parseFloat(avgWithJournal) - parseFloat(avgWithoutJournal);
      if (moodImprovement > 0.5 && data.journal.length < data.mood.length * 0.5) {
        recommendations.push({
          icon: '📝',
          title: 'Journal Regularly',
          description: `Journaling improves your mood by ${moodImprovement.toFixed(1)} points. Try journaling 3-4 times per week.`,
        });
      }
    }

    // Check if low mood correlates with weight gain
    const recentMood = data.mood.slice(-7);
    const recentWeight = data.weight.slice(-7);
    if (recentMood.length >= 5 && recentWeight.length >= 5) {
      const avgRecentMood = recentMood.reduce((sum, m) => sum + m.overall_mood, 0) / recentMood.length;
      if (avgRecentMood < 3) {
        recommendations.push({
          icon: '💚',
          title: 'Focus on Mental Wellness',
          description: `Your mood has been lower recently (${avgRecentMood.toFixed(1)}/5). Prioritize activities that boost your mood - exercise, social time, or hobbies you enjoy.`,
        });
      }
    }

    return recommendations;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <p className="text-muted">Loading insights...</p>
        </div>
      </div>
    );
  }

  const hasEnoughData = data.weight.length >= 5 && data.mood.length >= 5;

  if (!hasEnoughData) {
    return (
      <div className="page-container">
        <div className="insights-header">
          <h1>Insights</h1>
          <p className="insights-subtitle">Discover connections between your physical and mental health</p>
        </div>

        <div className="insights-empty-state">
          <span style={{ fontSize: '64px', marginBottom: '16px', display: 'block' }}>📊</span>
          <h3>Not Enough Data Yet</h3>
          <p>Keep tracking your weight, mood, and activities for at least 5 days to see personalized insights.</p>
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Current progress: {data.weight.length} weight entries, {data.mood.length} mood ratings
          </p>
        </div>
      </div>
    );
  }

  const timelineData = getCombinedTimelineData();
  const calorieMoodData = getCalorieMoodData();
  const { avgWithMeditation, avgWithoutMeditation } = getMeditationImpact();
  const { avgWithJournal, avgWithoutJournal } = getJournalImpact();
  const patterns = detectPatterns();
  const recommendations = getRecommendations();

  return (
    <div className="page-container">
      <div className="insights-header">
        <h1>Insights</h1>
        <p className="insights-subtitle">Discover how your physical and mental health are connected</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Combined Timeline */}
      <div className="insights-section">
        <h2>Mind-Body Connection Over Time</h2>
        <div className="insights-chart-card">
          <h3>Weight & Mood Trends</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                stroke="var(--text-secondary)"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                label={{ value: 'Mood / Stress', angle: 90, position: 'insideRight', fill: 'var(--text-secondary)' }}
                stroke="var(--text-secondary)"
              />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                stroke="var(--success)" 
                strokeWidth={3}
                dot={{ fill: 'var(--success)', r: 5 }}
                name="Weight (kg)"
                connectNulls
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="mood" 
                stroke="var(--info)" 
                strokeWidth={3}
                dot={{ fill: 'var(--info)', r: 5 }}
                name="Mood (1-5)"
                connectNulls
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="stress" 
                stroke="var(--warning)" 
                strokeWidth={2}
                dot={{ fill: 'var(--warning)', r: 4 }}
                name="Stress (1-10)"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--muted)' }}>
            Track how your weight changes align with your mood and stress levels
          </p>
        </div>
      </div>

      {/* Calorie-Mood Correlation */}
      {calorieMoodData.length >= 5 && (
        <div className="insights-section">
          <h2>Eating Patterns & Mental State</h2>
          <div className="insights-chart-card">
            <h3>Calorie Intake vs Stress Level</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="stress" 
                  name="Stress Level"
                  domain={[0, 10]}
                  stroke="var(--text-secondary)"
                  label={{ value: 'Stress Level', position: 'bottom', fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  dataKey="calories" 
                  name="Calories"
                  stroke="var(--text-secondary)"
                  label={{ value: 'Calorie Intake', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'Stress Level') return [`${value}/10`, 'Stress'];
                    if (name === 'Calories') return [`${value} cal`, 'Intake'];
                    return value;
                  }}
                />
                <Scatter 
                  data={calorieMoodData} 
                  fill="var(--primary)" 
                  name="Days"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--muted)' }}>
              Discover if stress affects your eating habits
            </p>
          </div>
        </div>
      )}

      {/* Activity Impact Stats */}
      <div className="insights-section">
        <h2>Activity Impact Analysis</h2>
        <div className="insights-grid">
          {avgWithMeditation && avgWithoutMeditation && (
            <>
              <div className="insights-stat-card">
                <span className="insights-stat-icon">🧘</span>
                <div className="insights-stat-title">Avg Stress (With Meditation)</div>
                <div className="insights-stat-value" style={{ color: 'var(--success)' }}>
                  {avgWithMeditation.stress}/10
                </div>
                <div className="insights-stat-description">
                  On days you meditate
                </div>
              </div>

              <div className="insights-stat-card">
                <span className="insights-stat-icon">😓</span>
                <div className="insights-stat-title">Avg Stress (Without Meditation)</div>
                <div className="insights-stat-value" style={{ color: 'var(--danger)' }}>
                  {avgWithoutMeditation.stress}/10
                </div>
                <div className="insights-stat-description">
                  On days without meditation
                </div>
              </div>

              <div className="insights-stat-card">
                <span className="insights-stat-icon">📉</span>
                <div className="insights-stat-title">Stress Reduction</div>
                <div className="insights-stat-value" style={{ color: 'var(--primary)' }}>
                  {(avgWithoutMeditation.stress - avgWithMeditation.stress).toFixed(1)}
                </div>
                <div className="insights-stat-description">
                  Points lower with meditation
                </div>
              </div>
            </>
          )}

          {avgWithJournal && avgWithoutJournal && (
            <>
              <div className="insights-stat-card">
                <span className="insights-stat-icon">📝</span>
                <div className="insights-stat-title">Avg Mood (With Journaling)</div>
                <div className="insights-stat-value" style={{ color: 'var(--success)' }}>
                  {avgWithJournal}/5
                </div>
                <div className="insights-stat-description">
                  On days you journal
                </div>
              </div>

              <div className="insights-stat-card">
                <span className="insights-stat-icon">😐</span>
                <div className="insights-stat-title">Avg Mood (Without Journaling)</div>
                <div className="insights-stat-value">
                  {avgWithoutJournal}/5
                </div>
                <div className="insights-stat-description">
                  On days without journaling
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <div className="insights-section">
          <h2>Detected Patterns</h2>
          {patterns.map((pattern, index) => (
            <div key={index} className="insights-pattern-card">
              <div className="insights-pattern-title">
                <span style={{ marginRight: '8px' }}>{pattern.icon}</span>
                {pattern.title}
              </div>
              <div className="insights-pattern-description">
                {pattern.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="insights-section">
          <h2>Personalized Recommendations</h2>
          {recommendations.map((rec, index) => (
            <div key={index} className="insights-recommendation-card">
              <div className="insights-recommendation-title">
                <span>{rec.icon}</span>
                {rec.title}
              </div>
              <div className="insights-recommendation-description">
                {rec.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;