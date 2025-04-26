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
          // Para las notas, aseguramos que estén en el rango 1.0 - 7.0
          if (field === 'grade') {
            const numValue = parseFloat(value.replace(',', '.'));
            if (!isNaN(numValue)) {
              if (numValue > 7) value = '7.0';
              else if (numValue < 1) value = '1.0';
            }
          }
          return { ...grade, [field]: value };
        }
        return grade;
      })
    );
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
  };

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

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
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
                          inputProps={{ inputMode: 'decimal', style: { textAlign: 'center' } }}
                          value={grade.grade}
                          onChange={(e) => updateGrade(grade.id, 'grade', e.target.value)}
                          sx={{ width: '70px' }}
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

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
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
      </Box>
    </Container>
  );
};

export default GradeCalculator;