import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box } from '@mui/material';

// Componente para renderizar listas virtualizadas (eficiente para miles de elementos)
const VirtualizedList = ({ items, renderItem, itemHeight = 72, emptyMessage = "No hay elementos" }) => {
  if (items.length === 0) {
    return <Box sx={{ p: 2 }}>{emptyMessage}</Box>;
  }

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <Box sx={{ height: '65vh', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
};

export default VirtualizedList;