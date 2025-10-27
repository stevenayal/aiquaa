'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Download,
  RotateCcw,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { ExamResult } from '../types';
import { exportToCSV, downloadCSV, formatTime } from '../utils';

interface ResultsScreenProps {
  result: ExamResult;
  onReset: () => void;
  mode: 'exam' | 'training';
}

export default function ResultsScreen({
  result,
  onReset,
  mode,
}: ResultsScreenProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const handleExportCSV = () => {
    const csv = exportToCSV(result);
    const filename = `istqb-resultado-${result.participantName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          AIQUAA | Simulacro CTFL v4.0
        </h1>
        <p className="text-muted-foreground">Resultados del Examen</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {result.participantName}
              </CardTitle>
              <CardDescription>
                Modo: {mode === 'exam' ? 'Examen' : 'Entrenamiento'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Nuevo Intento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert
            variant={result.passed ? 'default' : 'destructive'}
            className="mb-6"
          >
            {result.passed ? (
              <Trophy className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {result.passed ? '¡APROBADO!' : 'NO APROBADO'}
              </span>
              <span className="text-2xl font-bold">
                {result.score} / {result.totalQuestions}
              </span>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Puntaje</p>
              <p className="text-2xl font-bold">{result.score}</p>
            </div>

            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Correctas</p>
              <p className="text-2xl font-bold">{result.correctAnswers}</p>
            </div>

            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-muted-foreground">Incorrectas</p>
              <p className="text-2xl font-bold">{result.incorrectAnswers}</p>
            </div>

            <div className="text-center p-4 bg-secondary rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tiempo</p>
              <p className="text-2xl font-bold">
                {formatTime(result.timeSpent)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Porcentaje de Acierto</span>
              <span className="text-sm font-bold">
                {result.percentage.toFixed(2)}%
              </span>
            </div>
            <Progress value={result.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">
            <Target className="h-4 w-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="learning-objectives">
            <TrendingUp className="h-4 w-4 mr-2" />
            Por Learning Objective
          </TabsTrigger>
          <TabsTrigger value="details">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Detalle de Respuestas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Resultado:</h3>
                <p className="text-muted-foreground">
                  {result.passed ? (
                    <>
                      ¡Felicitaciones! Has aprobado el simulacro con un puntaje
                      de <strong>{result.score}</strong> sobre{' '}
                      {result.totalQuestions}, logrando un{' '}
                      <strong>{result.percentage.toFixed(2)}%</strong> de
                      aciertos. El puntaje mínimo requerido es 26 puntos (65%).
                    </>
                  ) : (
                    <>
                      No has alcanzado el puntaje mínimo de aprobación.
                      Obtuviste <strong>{result.score}</strong> puntos sobre{' '}
                      {result.totalQuestions}, equivalente a un{' '}
                      <strong>{result.percentage.toFixed(2)}%</strong>. Se
                      requieren al menos 26 puntos (65%) para aprobar. Te
                      recomendamos revisar las áreas de mejora identificadas y
                      volver a intentarlo.
                    </>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Fortalezas Identificadas:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.learningObjectiveAnalysis
                      .filter((lo) => lo.percentage >= 70)
                      .slice(0, 5)
                      .map((lo) => (
                        <li key={lo.learningObjective} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {lo.learningObjective}: {lo.correctAnswers}/
                          {lo.totalQuestions} ({lo.percentage.toFixed(0)}%)
                        </li>
                      ))}
                    {result.learningObjectiveAnalysis.filter(
                      (lo) => lo.percentage >= 70,
                    ).length === 0 && (
                      <li className="text-muted-foreground">
                        Ninguna área con desempeño sobresaliente identificada.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Áreas de Mejora:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.learningObjectiveAnalysis
                      .filter((lo) => lo.percentage < 70)
                      .slice(0, 5)
                      .map((lo) => (
                        <li key={lo.learningObjective} className="flex items-center gap-2">
                          <XCircle className="h-3 w-3 text-red-600" />
                          {lo.learningObjective}: {lo.correctAnswers}/
                          {lo.totalQuestions} ({lo.percentage.toFixed(0)}%)
                        </li>
                      ))}
                    {result.learningObjectiveAnalysis.filter(
                      (lo) => lo.percentage < 70,
                    ).length === 0 && (
                      <li className="text-muted-foreground">
                        ¡Excelente! No se identificaron áreas débiles
                        significativas.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning-objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Learning Objective</CardTitle>
              <CardDescription>
                Desempeño en cada objetivo de aprendizaje del syllabus ISTQB
                CTFL v4.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.learningObjectiveAnalysis.map((lo) => (
                  <div key={lo.learningObjective} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{lo.learningObjective}</span>
                      <span className="text-sm text-muted-foreground">
                        {lo.correctAnswers} / {lo.totalQuestions} (
                        {lo.percentage.toFixed(2)}%)
                      </span>
                    </div>
                    <Progress value={lo.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {result.answers.map((answer, index) => (
            <Card
              key={answer.questionId}
              className={
                answer.isCorrect
                  ? 'border-green-500'
                  : 'border-destructive'
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Pregunta {index + 1}
                    {answer.isCorrect ? (
                      <CheckCircle2 className="inline ml-2 h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="inline ml-2 h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <div className="flex gap-2 text-sm">
                    <span className="px-2 py-1 bg-secondary rounded">
                      {answer.learningObjective}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 rounded">
                      {answer.kLevel}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base">{answer.questionText}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tu Respuesta:</h4>
                    <p
                      className={`p-2 rounded ${
                        answer.isCorrect
                          ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                          : 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100'
                      }`}
                    >
                      {answer.userAnswer.join(', ') || 'Sin responder'}
                    </p>
                  </div>

                  {!answer.isCorrect && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Respuesta Correcta:
                      </h4>
                      <p className="p-2 rounded bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100">
                        {answer.correctAnswer.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {!answer.isCorrect && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Explicación:</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(answer.explanations).map(
                        ([label, exp]) => (
                          <div
                            key={label}
                            className={`p-3 rounded ${
                              exp.correct
                                ? 'bg-green-50 dark:bg-green-950/50 border-l-4 border-green-500'
                                : 'bg-gray-50 dark:bg-gray-900/50'
                            }`}
                          >
                            <span className="font-semibold">
                              Opción {label}:{' '}
                              {exp.correct ? '(Correcta)' : '(Incorrecta)'}
                            </span>
                            <p className="mt-1">{exp.explanation}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
