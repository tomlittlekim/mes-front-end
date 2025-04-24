{ field: 'changeQty', 
  headerName: '변동수량',
  width: 100,
  headerAlign: 'center',
  align: 'center',
  editable: false,
  renderCell: (params) => {
    const value = params.value;
    const color = value > 0 ? '#4caf50' : value < 0 ? '#f44336' : 'inherit';

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <Typography sx={{ color, fontWeight: '' }}>
          {parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
        </Typography>
      </Box>
    );
  },
}, 