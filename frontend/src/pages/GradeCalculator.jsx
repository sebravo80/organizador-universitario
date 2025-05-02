import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField, IconButton, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Alert, Card, CardContent, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const GradeCalculator = () => {
  const [grades, setGrades] = useState([
    { id: 1, name: "Evaluación 1", grade: "", percentage: 30 },
    { id: 2, name: "Evaluación 2", grade: "", percentage: 30 },
    { id: 3, name: "Examen final", grade: "", percentage: 40 }
  ]);
  const [nextId, setNextId] = useState(4);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [targetAverage, setTargetAverage] = useState("4.0");
  const [missingGrade, setMissingGrade] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState({});
  const [configName, setConfigName] = useState("");

  // Calcular la suma de porcentajes para validar que sea 100%
  const totalPercentage = grades.reduce((sum, grade) => sum + Number(grade.percentage), 0);

  // Agregar nueva nota
  const addGrade = () => {
    const newGrade = {
      id: nextId,
      name: `Evaluación ${nextId}`,
      grade: "",
      percentage: Math.max(0, 100 - totalPercentage)
    };
    setGrades([...grades, newGrade]);
    setNextId(nextId + 1);
  };

  // Eliminar una nota
  const removeGrade = (id) => {
    if (grades.length > 1) {
      setGrades(grades.filter(grade => grade.id !== id));
    }
  };

  // Actualizar valores de las notas
  const updateGrade = (id, field, value) => {
    setGrades(
      grades.map(grade => {
        if (grade.id === id) {
          if (field === 'grade') {
            // Si está vacío permitirlo
            if (value === "") {
              return { ...grade, [field]: value };
            }
            
            // Eliminar todos los no numéricos excepto punto o coma
            const cleanedValue = value.replace(/[^\d.,]/g, '');
            
            // Caso especial: si se ingresa un número de 2 cifras sin punto ni coma
            if (/^\d{2}$/.test(cleanedValue) && !cleanedValue.includes('.') && !cleanedValue.includes(',')) {
              const firstDigit = cleanedValue.charAt(0);
              const secondDigit = cleanedValue.charAt(1);
              value = `${firstDigit}.${secondDigit}`;
            } else {
              value = cleanedValue;
            }
            
            // Asegurar que solo haya un separador decimal
            if ((value.includes('.') && value.includes(',')) || 
                (value.split('.').length > 2) || 
                (value.split(',').length > 2)) {
              // Usar solo el primer separador encontrado
              const dotIndex = value.indexOf('.');
              const commaIndex = value.indexOf(',');
              
              if (dotIndex >= 0 && (commaIndex < 0 || dotIndex < commaIndex)) {
                value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/[.,]/g, '');
              } else if (commaIndex >= 0) {
                value = value.substring(0, commaIndex + 1) + value.substring(commaIndex + 1).replace(/[.,]/g, '');
              }
            }
            
            // Convertir coma a punto para cálculos
            const calcValue = value.replace(',', '.');
            
            // Validar rango
            const numValue = parseFloat(calcValue);
            if (!isNaN(numValue)) {
              if (numValue > 7) value = "7.0";
              if (numValue < 1) value = "1.0";
            }
            
            // Limitar a 1 decimal como máximo
            if (value.includes('.') || value.includes(',')) {
              const parts = value.replace(',', '.').split('.');
              if (parts[1] && parts[1].length > 1) {
                parts[1] = parts[1].substring(0, 1);
                value = parts.join('.');
              }
            }
            
            // Formatear para mostrar (usar coma visual)
            return { ...grade, [field]: value.replace('.', ',') };
          }
            
          if (field === 'percentage') {
            // Asegurar que el porcentaje sea un número entero positivo
            value = parseInt(value) || 0;
            if (value < 0) value = 0;
            if (value > 100) value = 100;
            
            return { ...grade, [field]: value };
          }
            
          return { ...grade, [field]: value };
        }
        return grade;
      })
    );
    
    // Restablecer resultados cuando cambie cualquier valor
    setResult(null);
    setMissingGrade(null);
  };

  // Calcular el promedio ponderado
  const calculateAverage = () => {
    setError("");
    
    // Validar que la suma de porcentajes sea 100%
    if (totalPercentage !== 100) {
      setError(`La suma de porcentajes debe ser 100%. Actualmente es ${totalPercentage}%`);
      return;
    }

    // Validar que todas las notas tengan valores válidos
    const invalidGrades = grades.filter(grade => {
      // Si la nota está vacía
      if (!grade.grade.toString().trim()) {
        return true;
      }
      
      const numGrade = parseFloat(grade.grade.toString().replace(',', '.'));
      return isNaN(numGrade) || numGrade < 1 || numGrade > 7;
    });

    if (invalidGrades.length > 0) {
      setError("Todas las notas deben tener valores entre 1.0 y 7.0");
      return;
    }

    // Calcular promedio ponderado
    let weightedSum = 0;
    grades.forEach(grade => {
      const numGrade = parseFloat(grade.grade.toString().replace(',', '.'));
      weightedSum += numGrade * (grade.percentage / 100);
    });

    // Redondear a 1 decimal
    const roundedAverage = Math.round(weightedSum * 10) / 10;
    setResult(roundedAverage.toFixed(1));
  };

  // Calcular la nota faltante
  const calculateMissingGrade = () => {
    setError("");
    
    // Validar que el target sea un número válido
    const target = parseFloat(targetAverage.replace(',', '.'));
    if (isNaN(target) || target < 1 || target > 7) {
      setError("La nota objetivo debe estar entre 1.0 y 7.0");
      return;
    }
    
    // Encontrar evaluaciones con nota y sin nota
    const withGrades = grades.filter(g => g.grade.toString().trim() !== "");
    const withoutGrades = grades.filter(g => g.grade.toString().trim() === "");
    
    if (withoutGrades.length !== 1) {
      setError("Para este cálculo, debes tener exactamente una evaluación sin nota");
      return;
    }
    
    const pendingEval = withoutGrades[0];
    
    // Calcular suma ponderada actual
    let currentWeightedSum = 0;
    withGrades.forEach(grade => {
      const numGrade = parseFloat(grade.grade.toString().replace(',', '.'));
      currentWeightedSum += numGrade * (grade.percentage / 100);
    });
    
    // Calcular nota necesaria: (objetivo - suma_actual) / porcentaje_pendiente * 100
    const neededGrade = (target - currentWeightedSum) / (pendingEval.percentage / 100);
    
    // Validar que el resultado sea alcanzable
    if (neededGrade < 1 || neededGrade > 7) {
      if (neededGrade < 1) {
        setMissingGrade({
          evalName: pendingEval.name,
          grade: "1.0 (mínima)",
          message: `Con las notas actuales, ¡ya alcanzarás un promedio mayor a ${targetAverage.replace('.', ',')}!`
        });
      } else {
        setMissingGrade({
          evalName: pendingEval.name,
          grade: "Imposible",
          message: `Con las notas actuales, no es posible alcanzar un promedio de ${targetAverage.replace('.', ',')} en esta asignatura.`
        });
      }
    } else {
      // Redondear a 1 decimal
      const roundedGrade = Math.round(neededGrade * 10) / 10;
      setMissingGrade({
        evalName: pendingEval.name,
        grade: roundedGrade.toFixed(1).replace('.', ','),
        message: `Necesitas obtener al menos esta nota para alcanzar un promedio de ${targetAverage.replace('.', ',')}`
      });
    }
  };

  // Guardar configuración actual
  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      setError("Ingresa un nombre para guardar esta configuración");
      return;
    }
    
    const newConfigs = {
      ...savedConfigs,
      [configName]: {
        grades: [...grades],
        nextId,
        date: new Date().toLocaleDateString()
      }
    };
    
    setSavedConfigs(newConfigs);
    localStorage.setItem('gradeCalculatorConfigs', JSON.stringify(newConfigs));
    setConfigName("");
  };

  // Cargar configuración guardada
  const loadConfig = (name) => {
    if (savedConfigs[name]) {
      setGrades(savedConfigs[name].grades);
      setNextId(savedConfigs[name].nextId);
      setResult(null);
      setError("");
      setMissingGrade(null);
    }
  };

  // Eliminar configuración guardada
  const deleteConfig = (name) => {
    const { [name]: _, ...restConfigs } = savedConfigs;
    setSavedConfigs(restConfigs);
    localStorage.setItem('gradeCalculatorConfigs', JSON.stringify(restConfigs));
  };

  // Reiniciar el formulario
  const resetCalculator = () => {
    setGrades([
      { id: 1, name: "Evaluación 1", grade: "", percentage: 30 },
      { id: 2, name: "Evaluación 2", grade: "", percentage: 30 },
      { id: 3, name: "Examen final", grade: "", percentage: 40 }
    ]);
    setNextId(4);
    setResult(null);
    setError("");
    setTargetAverage("4.0");
    setMissingGrade(null);
  };

  // Cargar configuraciones guardadas al montar el componente
  useEffect(() => {
    const savedData = localStorage.getItem('gradeCalculatorConfigs');
    if (savedData) {
      setSavedConfigs(JSON.parse(savedData));
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calculadora de Notas
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" gutterBottom>
              Ingresa tus notas y sus porcentajes para calcular tu promedio ponderado.
              Puedes agregar o quitar evaluaciones según necesites.
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              La suma de todos los porcentajes debe ser exactamente 100%
            </Alert>

            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 3,
                overflowX: 'auto',
                '& .MuiTableCell-root': {
                  p: { xs: '8px 4px', sm: '16px' }
                }
              }}
            >
              <Table size={window.innerWidth < 600 ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="center">Nota (1.0 - 7.0)</TableCell>
                    <TableCell align="center">Porcentaje (%)</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          variant="standard"
                          value={grade.name}
                          onChange={(e) => updateGrade(grade.id, 'name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          variant="standard"
                          type="text"
                          placeholder="1.0-7.0"
                          inputProps={{ 
                            inputMode: 'decimal', 
                            style: { textAlign: 'center' },
                            maxLength: 3,  // Limitamos a 3 caracteres (ej. "7.0")
                            pattern: "[0-9.,]*" // Solo permitimos números, punto y coma
                          }}
                          value={grade.grade}
                          onChange={(e) => updateGrade(grade.id, 'grade', e.target.value)}
                          helperText={
                            parseFloat(grade.grade.replace(',', '.')) > 7 || 
                            parseFloat(grade.grade.replace(',', '.')) < 1 && grade.grade !== "" 
                              ? "Fuera de rango" 
                              : " "
                          }
                          error={parseFloat(grade.grade.replace(',', '.')) > 7 || 
                                parseFloat(grade.grade.replace(',', '.')) < 1 && 
                                grade.grade !== ""}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          variant="standard"
                          type="number"
                          inputProps={{ min: 0, max: 100, style: { textAlign: 'center' } }}
                          value={grade.percentage}
                          onChange={(e) => updateGrade(grade.id, 'percentage', parseInt(e.target.value) || 0)}
                          sx={{ width: '70px' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => removeGrade(grade.id)}
                          disabled={grades.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <Typography variant="body2" fontWeight="bold">
                        Suma de porcentajes:
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        color={totalPercentage === 100 ? "success.main" : "error.main"}
                      >
                        {totalPercentage}%
                      </Typography>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' }
              }
            }}>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addGrade}
              >
                Agregar evaluación
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CalculateIcon />}
                onClick={calculateAverage}
                color="primary"
              >
                Calcular promedio
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RestartAltIcon />}
                onClick={resetCalculator}
                color="secondary"
              >
                Reiniciar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {result !== null && (
          <Card sx={{ mt: 3, mb: 3, backgroundColor: 'primary.dark' }}>
            <CardContent>
              <Typography variant="h5" component="div" align="center" color="white">
                Tu promedio ponderado es:
              </Typography>
              <Typography variant="h2" component="div" align="center" color="white" sx={{ mt: 2 }}>
                {result.replace('.', ',')}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mt: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Calcular nota necesaria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Deja en blanco exactamente una nota y calcula cuánto necesitas para alcanzar el promedio deseado.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2, 
              mb: 2 
            }}>
              <TextField
                label="Promedio objetivo"
                value={targetAverage}
                onChange={(e) => setTargetAverage(e.target.value)}
                variant="outlined"
                placeholder="4.0"
                inputProps={{ 
                  inputMode: 'decimal', 
                  style: { textAlign: 'center' }
                }}
                sx={{ width: { xs: '100%', sm: '150px' } }}
              />
              
              <Button 
                variant="contained" 
                onClick={calculateMissingGrade}
                color="secondary"
              >
                Calcular nota necesaria
              </Button>
            </Box>
            
            {missingGrade && (
              <Alert 
                severity={missingGrade.grade === "Imposible" ? "error" : "success"}
                sx={{ mt: 2 }}
              >
                <Typography variant="subtitle1">
                  {missingGrade.evalName}: <strong>{missingGrade.grade}</strong>
                </Typography>
                <Typography variant="body2">
                  {missingGrade.message}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mt: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="h5" component="div" align="center">
              Guardar y cargar configuraciones
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre de configuración"
                variant="outlined"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                inputProps={{ style: { textAlign: 'center' } }}
              />
              <Button 
                variant="contained" 
                onClick={saveCurrentConfig}
                color="primary"
              >
                Guardar configuración
              </Button>
            </Box>
            {Object.keys(savedConfigs).length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" component="div" align="center">
                  Configuraciones guardadas
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="center">Fecha</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(savedConfigs).map(([name, config]) => (
                        <TableRow key={name}>
                          <TableCell>{name}</TableCell>
                          <TableCell align="center">{config.date}</TableCell>
                          <TableCell align="center">
                            <Button 
                              variant="outlined" 
                              onClick={() => loadConfig(name)}
                              color="primary"
                              sx={{ mr: 1 }}
                            >
                              Cargar
                            </Button>
                            <Button 
                              variant="outlined" 
                              onClick={() => deleteConfig(name)}
                              color="error"
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mt: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Guardar/cargar configuraciones
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 2, 
              mb: 3 
            }}>
              <TextField
                label="Nombre de la asignatura"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                variant="outlined"
                placeholder="Ej: Cálculo II"
                fullWidth
                size="small"
              />
              
              <Button 
                variant="contained"
                onClick={saveCurrentConfig}
                sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
              >
                Guardar configuración
              </Button>
            </Box>
            
            {Object.keys(savedConfigs).length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Configuraciones guardadas:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {Object.entries(savedConfigs).map(([name, config]) => (
                    <Paper 
                      key={name} 
                      elevation={1}
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Guardado: {config.date} • {config.grades.length} evaluaciones
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => loadConfig(name)}
                        >
                          Cargar
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => deleteConfig(name)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default GradeCalculator;