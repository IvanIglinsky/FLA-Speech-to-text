import React, { useState, useEffect } from 'react';

const Visualizer = ({ connectStream }) => {
    const [visualElements, setVisualElements] = useState([]);
    const visualValueCount = 16;
    let audioContext;
    let analyser;

    const createDOMElements = () => {
        const elements = [];
        for (let i = 0; i < visualValueCount; ++i) {
            const elm = <div key={i}></div>;
            elements.push(elm);
        }
        return elements;
    };

    const dataMap = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };

    const processFrame = (data) => {
        const values = Object.values(data);
        visualElements.forEach((_, i) => {
            const value = values[dataMap[i]] / 255;
            const elmStyles = visualElements[i].props.style;
            elmStyles.transform = `scaleY(${value})`;
            elmStyles.opacity = Math.max(0.25, value);
        });
    };

    const processError = () => {
        // Handle error logic
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const initRenderLoop = () => {
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        const renderFrame = () => {
            if (!audioContext) {
                return;
            }

            analyser.getByteFrequencyData(frequencyData);
            processFrame(frequencyData);

            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
    };

    useEffect(() => {
        handleUserGesture();
    }, []);

    const handleUserGesture = async () => {
        try {
            if (!audioContext) {
                audioContext = new AudioContext();

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                connectStream(stream);

                setVisualElements(createDOMElements());
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
            processError();
        }
    };

    return <main>{visualElements}</main>;
};

export default Visualizer;
