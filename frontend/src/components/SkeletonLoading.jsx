// importamos las librerias
import React from 'react';
import { Grid, Skeleton, Card, CardContent, CardActions, Box } from '@mui/material';

// este componente se encarga de mostrar un skeleton de carga
// se llama así mientras carga la información de las tarjetas
const SkeletonTaskCard = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Skeleton variant="text" height={32} width="80%" />
        <Box sx={{ mt: 1, mb: 2 }}>
          <Skeleton variant="rectangular" height={24} width={80} sx={{ borderRadius: 1, display: 'inline-block', mr: 1 }} />
          <Skeleton variant="rectangular" height={24} width={120} sx={{ borderRadius: 1, display: 'inline-block' }} />
        </Box>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="60%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={24} width={140} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
      <CardActions>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
        <Skeleton variant="circular" width={32} height={32} />
      </CardActions>
    </Card>
  );
};

const SkeletonLoading = ({ type = 'task', count = 6 }) => {
  return (
    <Grid container spacing={3}>
      {Array(count).fill(0).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <SkeletonTaskCard />
        </Grid>
      ))}
    </Grid>
  );
};

export default SkeletonLoading;