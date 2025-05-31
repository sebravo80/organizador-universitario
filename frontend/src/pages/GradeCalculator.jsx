import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Typography, Box, Button, TextField, IconButton, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Alert, Card, CardContent, Divider, useTheme,
  useMediaQuery, Chip, Tooltip, Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TargetIcon from '@mui/icons-material/GpsFixed';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ClassIcon from '@mui/icons-material/Class';
import Loading from '../components/Loading';

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
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDarkMode = theme.palette.mode === 'dark';

  const totalPercentage = useMemo(() => {
    return grades.reduce((sum, grade) => sum + Number(grade.percentage), 0);
  }, [grades]);

  const percentageValid = useMemo(() => totalPercentage === 100, [totalPercentage]);

  const percentageColor = useMemo(() => {
    if (totalPercentage < 100) return "warning.main";
    if (totalPercentage > 100) return "error.main";
    return "success.main";
  }, [totalPercentage]);

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

  const removeGrade = (id) => {
    if (grades.length > 1) {
      setGrades(grades.filter(grade => grade.id !== id));
    }
  };

  const updateGrade = (id, field, value) => {
    setGrades(
      grades.map(grade => {
        if (grade.id === id) {
          if (field === 'grade') {
            if (value === "") {
              return { ...grade, [field]: value };
            }
            const cleanedValue = value.replace(/[^\d.,]/g, '');
            if (/^\d{2}$/.test(cleanedValue) && !cleanedValue.includes('.') && !cleanedValue.includes(',')) {
              const firstDigit = cleanedValue.charAt(0);
              const secondDigit = cleanedValue.charAt(1);
              value = `${firstDigit}.${secondDigit}`;
            } else {
              value = cleanedValue;
            }
            if ((value.includes('.') && value.includes(',')) || 
                (value.split('.').length > 2) || 
                (value.split(',').length > 2)) {
              const dotIndex = value.indexOf('.');
              const commaIndex = value.indexOf(',');
              if (dotIndex >= 0 && (commaIndex < 0 || dotIndex < commaIndex)) {
                value = value.substring(0, dotIndex + 1) + value.substring(dotIndex + 1).replace(/[.,]/g, '');
              } else if (commaIndex >= 0) {
                value = value.substring(0, commaIndex + 1) + value.substring(commaIndex + 1).replace(/[.,]/g, '');
              }
            }
            const calcValue = value.replace(',', '.');
            const numValue = parseFloat(calcValue);
            if (!isNaN(numValue)) {
              if (numValue > 7) value = "7.0";
              if (numValue < 1) value = "1.0";
            }
            if (value.includes('.') || value.includes(',')) {
              const parts = value.replace(',', '.').split('.');
              if (parts[1] && parts[1].length > 1) {
                parts[1] = parts[1].substring(0, 1);
                value = parts.join('.');
              }
            }
            return { ...grade, [field]: value.replace('.', ',') };
          }
          if (field === 'percentage') {
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
    setResult(null);
    setMissingGrade(null);
  };

  const calculateAverage = () => {
    setError("");
    if (totalPercentage !== 100) {
      setError(`La suma de porcentajes debe ser 100%. Actualmente es ${totalPercentage}%`);
      return;
    }
    const invalidGrades = grades.filter(grade => {
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
    let weightedSum = 0;
    grades.forEach(grade => {
      const numGrade = parseFloat(grade.grade.toString().replace(',', '.'));
      weightedSum += numGrade * (grade.percentage / 100);
    });
    const roundedAverage = Math.round(weightedSum * 10) / 10;
    setResult(roundedAverage.toFixed(1));
  };

  const calculateMissingGrade = () => {
    setError("");
    const target = parseFloat(targetAverage.replace(',', '.'));
    if (isNaN(target) || target < 1 || target > 7) {
      setError("La nota objetivo debe estar entre 1.0 y 7.0");
      return;
    }
    const withGrades = grades.filter(g => g.grade.toString().trim() !== "");
    const withoutGrades = grades.filter(g => g.grade.toString().trim() === "");
    if (withoutGrades.length !== 1) {
      setError("Para este cálculo, debes tener exactamente una evaluación sin nota");
      return;
    }
    const pendingEval = withoutGrades[0];
    let currentWeightedSum = 0;
    withGrades.forEach(grade => {
      const numGrade = parseFloat(grade.grade.toString().replace(',', '.'));
      currentWeightedSum += numGrade * (grade.percentage / 100);
    });
    const neededGrade = (target - currentWeightedSum) / (pendingEval.percentage / 100);
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
      const roundedGrade = Math.round(neededGrade * 10) / 10;
      setMissingGrade({
        evalName: pendingEval.name,
        grade: roundedGrade.toFixed(1).replace('.', ','),
        message: `Necesitas obtener al menos esta nota para alcanzar un promedio de ${targetAverage.replace('.', ',')}`
      });
    }
  };

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

  const loadConfig = (name) => {
    if (savedConfigs[name]) {
      setGrades(savedConfigs[name].grades);
      setNextId(savedConfigs[name].nextId);
      setResult(null);
      setError("");
      setMissingGrade(null);
    }
  };

  const deleteConfig = (name) => {
    const { [name]: _, ...restConfigs } = savedConfigs;
    setSavedConfigs(restConfigs);
    localStorage.setItem('gradeCalculatorConfigs', JSON.stringify(restConfigs));
  };

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

  const loadSavedConfigs = useCallback(() => {
    const savedData = localStorage.getItem('gradeCalculatorConfigs');
    if (savedData) {
      setSavedConfigs(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    loadSavedConfigs();
  }, [loadSavedConfigs]);

  if (loading) {
    return <Loading message="Cargando calculadora" showLogo={true} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        mt: 4, 
        mb: 4,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Typography variant="h4" component="h1" 
          className="page-title"
          sx={{ 
            display: 'flex',
            alignItems: 'center', 
            gap: 1,
            mb: 3
          }}
        >
          <CalculateIcon fontSize="large" />
          Calculadora de Notas
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              animation: 'shake 0.5s',
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
              }
            }}
            variant="filled"
          >
            {error}
          </Alert>
        )}

        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="body1" 
              gutterBottom
              sx={{ 
                borderLeft: '4px solid', 
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: '0 8px 8px 0'
              }}
            >
              Ingresa tus notas y sus porcentajes para calcular tu promedio ponderado.
              Puedes agregar o quitar evaluaciones según necesites.
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2,
                mb: 3,
                'MuiAlert-icon': { 
                  alignItems: 'center'
                }
              }}
              icon={<FormatListNumberedIcon />}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography component="span">La suma de todos los porcentajes debe ser exactamente</Typography>
                <Chip 
                  label="100%" 
                  color={percentageValid ? "success" : "warning"}
                  size="small" 
                  sx={{ ml: 1, fontWeight: 700 }}
                />
              </Box>
            </Alert>

            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 3,
                overflowX: 'auto',
                '& .MuiTableCell-root': {
                  p: { xs: '8px 4px', sm: '16px' }
                },
                borderRadius: '8px',
                boxShadow: percentageValid ? '0 0 0 2px rgba(76, 175, 80, 0.2)' : '0 0 0 2px rgba(255, 152, 0, 0.2)',
                transition: 'all 0.3s ease',
                bgcolor: 'transparent'
              }}
            >
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(66, 66, 66, 0.8)' 
                      : 'rgba(0, 0, 0, 0.03)'
                  }}>
                    <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Nota (1.0 - 7.0)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Porcentaje (%)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade, index) => (
                    <TableRow 
                      key={grade.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.03)' 
                            : 'rgba(0, 0, 0, 0.02)' 
                        },
                        transition: 'background-color 0.2s',
                        '&:hover': { 
                          bgcolor: theme => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.04)' 
                        }
                      }}
                    >
                      <TableCell>
                        <TextField
                          fullWidth
                          variant="filled"
                          size="small"
                          value={grade.name}
                          onChange={(e) => updateGrade(grade.id, 'name', e.target.value)}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: '8px',
                              bgcolor: 'transparent',
                              '&::before, &::after': { display: 'none' }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          variant="filled"
                          size="small"
                          type="text"
                          placeholder="1.0-7.0"
                          inputProps={{ 
                            inputMode: 'decimal', 
                            style: { textAlign: 'center' },
                            maxLength: 3,
                            pattern: "[0-9.,]*" 
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
                          sx={{ 
                            width: { xs: '70px', sm: '90px' },
                            '& .MuiFilledInput-root': {
                              borderRadius: '8px',
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.04)',
                              '&::before, &::after': { display: 'none' }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          variant="filled"
                          size="small"
                          type="number"
                          inputProps={{ 
                            min: 0, 
                            max: 100, 
                            style: { textAlign: 'center' } 
                          }}
                          value={grade.percentage}
                          onChange={(e) => updateGrade(grade.id, 'percentage', parseInt(e.target.value) || 0)}
                          sx={{ 
                            width: { xs: '65px', sm: '80px' },
                            '& .MuiFilledInput-root': {
                              borderRadius: '8px',
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.04)',
                              '&::before, &::after': { display: 'none' }
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Eliminar evaluación">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => removeGrade(grade.id)}
                              disabled={grades.length <= 1}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(244, 67, 54, 0.2)'
                                },
                                transition: 'transform 0.2s',
                                '&:hover:enabled': {
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)'
                  }}>
                    <TableCell colSpan={2} align="right">
                      <Typography variant="body2" fontWeight="bold">
                        Suma de porcentajes:
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        color={percentageColor}
                        sx={{ 
                          transition: 'all 0.3s ease',
                          animation: totalPercentage === 100 ? 'pulse 1s' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' }
                          }
                        }}
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
              mt: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
                borderRadius: '8px',
                py: 1
              }
            }}>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addGrade}
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.15)'
                  }
                }}
              >
                Agregar evaluación
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CalculateIcon />}
                onClick={calculateAverage}
                color="primary"
                disableElevation
                sx={{ 
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }
                }}
              >
                Calcular promedio
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RestartAltIcon />}
                onClick={resetCalculator}
                color="secondary"
                sx={{ 
                  ml: 'auto',
                  bgcolor: 'rgba(156, 39, 176, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.12)'
                  }
                }}
              >
                Reiniciar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {result !== null && (
          <Card 
            sx={{ 
              mt: 3, 
              mb: 3, 
              bgcolor: 'primary.main', 
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              animation: 'slideIn 0.5s ease',
              '@keyframes slideIn': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 50%)',
                opacity: 0.5
              }
            }}
          >
            <CardContent>
              <Typography variant="h5" component="div" align="center" color="white">
                Tu promedio ponderado es:
              </Typography>
              <Typography 
                variant="h1" 
                component="div" 
                align="center" 
                color="white" 
                sx={{ 
                  mt: 2,
                  fontSize: { xs: '3rem', sm: '4rem' },
                  fontWeight: 700,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                {result.replace('.', ',')}
              </Typography>
              <Typography 
                variant="body2" 
                color="rgba(255,255,255,0.8)" 
                align="center"
                sx={{ mt: 1 }}
              >
                {parseFloat(result) >= 4.0 ? 
                  "¡Felicitaciones! Has aprobado la asignatura." : 
                  "Necesitas al menos 4.0 para aprobar la asignatura."}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card 
          sx={{ 
            mt: 3, 
            mb: 4, 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                mb: 2
              }}
            >
              <TargetIcon sx={{ mr: 1, color: 'secondary.main' }} />
              Calcular nota necesaria
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                bgcolor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.04)',
                p: 1.5,
                borderRadius: '8px', 
                border: '1px dashed', 
                borderColor: 'divider'
              }}
            >
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
                InputProps={{ 
                  startAdornment: <TargetIcon color="action" sx={{ mr: 1 }} />
                }}
                inputProps={{ 
                  inputMode: 'decimal', 
                  style: { textAlign: 'center' }
                }}
                sx={{ 
                  width: { xs: '100%', sm: '180px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                focused
              />
              <Button 
                variant="contained" 
                onClick={calculateMissingGrade}
                color="secondary"
                size="large"
                disableElevation
                sx={{
                  borderRadius: '8px',
                  py: 1.5,
                  px: 3,
                  width: { xs: '100%', sm: 'auto' },
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Calcular nota necesaria
              </Button>
            </Box>
            
            {missingGrade && (
              <Fade in={!!missingGrade}>
                <Alert 
                  severity={missingGrade.grade === "Imposible" ? "error" : "success"}
                  sx={{ 
                    mt: 2,
                    borderRadius: '8px',
                    animation: 'fadeInUp 0.5s',
                    '@keyframes fadeInUp': {
                      '0%': { opacity: 0, transform: 'translateY(10px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                  variant={missingGrade.grade === "Imposible" ? "filled" : "outlined"}
                  icon={missingGrade.grade === "Imposible" ? undefined : <CalculateIcon />}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {missingGrade.evalName}: <strong>{missingGrade.grade}</strong>
                  </Typography>
                  <Typography variant="body2">
                    {missingGrade.message}
                  </Typography>
                </Alert>
              </Fade>
            )}
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            mt: 3, 
            mb: 3, 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            bgcolor: 'transparent', 
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                color: 'primary.main'
              }}
            >
              <SaveIcon sx={{ mr: 1 }} />
              Guardar y cargar configuraciones
            </Typography>
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              alignItems: 'flex-start'
            }}>
              <TextField
                label="Nombre de la asignatura"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                variant="outlined"
                placeholder="Ej: Cálculo II"
                fullWidth
                InputProps={{ 
                  startAdornment: <FolderOpenIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
              
              <Button 
                variant="contained"
                onClick={saveCurrentConfig}
                sx={{ 
                  whiteSpace: 'nowrap', 
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: '8px',
                  py: 1.5,
                  px: 3,
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
                startIcon={<SaveIcon />}
                disableElevation
              >
                Guardar configuración
              </Button>
            </Box>
            
            {Object.keys(savedConfigs).length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ClassIcon sx={{ mr: 1, color: 'primary.light' }} />
                  Configuraciones guardadas:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5
                }}>
                  {Object.entries(savedConfigs).map(([name, config]) => (
                    <Paper 
                      key={name} 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        bgcolor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(66, 66, 66, 0.6)' 
                          : 'background.paper',
                        '&:hover': {
                          boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                          borderColor: 'primary.light',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <ClassIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.light', opacity: 0.7 }} />
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
                          startIcon={<FolderOpenIcon />}
                          sx={{ 
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            bgcolor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(25, 118, 210, 0.15)' 
                              : 'transparent',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(25, 118, 210, 0.25)' 
                                : 'rgba(25, 118, 210, 0.08)'
                            }
                          }}
                        >
                          Cargar
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => deleteConfig(name)}
                          startIcon={<DeleteIcon />}
                          sx={{ 
                            borderRadius: '6px',
                            bgcolor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(244, 67, 54, 0.15)' 
                              : 'rgba(244, 67, 54, 0.08)',
                            '&:hover': {
                              bgcolor: theme => theme.palette.mode === 'dark' 
                                ? 'rgba(244, 67, 54, 0.25)' 
                                : 'rgba(244, 67, 54, 0.16)'
                            }
                          }}
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