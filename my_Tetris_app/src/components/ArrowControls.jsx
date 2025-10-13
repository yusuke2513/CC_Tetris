import React from "react";

const ArrowControls = ({ onLeft, onRight, onDown, styles }) => {
    return (
        <div>
            <div style={styles.controlsWrapper}>
                <button style={styles.arrowButton} onClick={onLeft}>
                    ←
                </button>
                <button style={styles.arrowButton} onClick={onRight}>
                    →
                </button>
            </div>
            <div style={styles.controlsBottom}>
                <button style={styles.arrowButton} onClick={onDown}>
                    ↓
                </button>
            </div>
        </div>
    );
};

export default ArrowControls;
