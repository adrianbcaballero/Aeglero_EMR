import React from "react";
import '../styles/Student.css'

const colors = [{hex:'#FF0000', c:'red'}, {hex:'#f4891d', c:'orange'}, {hex:'#0000FF', c: 'blue'}, {hex:'#FFFF00', c: 'yellow'}, 
                    {hex:'#0aa350', c:'green'}, {hex:'#000000', c:'black'}, {hex:'#d90b91', c: 'pink'}, {hex:'#6b300d', c: 'brown'}];

const ColorChoice = ({selectedColor, onSelect}) => {
    return (
        <div className="snt-card-center">
            <h2 className="snt-desc-text-small">Select a color that represents your mood:</h2>
            <div
                style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                justifyItems: 'center',
                marginTop: '2vh',
                }}
            >
                {colors.map((color) => (
                    <div
                        key={color.c}
                        onClick={() => onSelect(color.c)}
                        style={{
                        backgroundColor: color.hex,
                        width: '100px',
                        height: '100px',
                        borderRadius: '15%',
                        margin: '1vh',
                        border: selectedColor === color.c ? "3px solid #c8c8c8" : "2px solid gray",
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ColorChoice