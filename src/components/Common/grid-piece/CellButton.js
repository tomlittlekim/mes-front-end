import React from 'react';
import { Button } from '@mui/material';

const CellButton = ({ params, onClick, label, color = "primary" }) => {
    return (
        <Button
            variant="outlined"
            color={color}
            onClick={() => onClick(params)}
            sx={{
                width: '90%',
                height: '90%',
                backgroundColor: '#e3f2fd',
                '&:hover': {
                    backgroundColor: '#bbdefb',
                },
            }}
        >
            {label}
        </Button>
    );
};

export default CellButton;
