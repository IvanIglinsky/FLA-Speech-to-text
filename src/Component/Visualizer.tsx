import React, { useEffect } from 'react';

interface VisualizerProps {
    connectStream: (stream: MediaStream) => void;
}

class AudioVisualizer {
    private audioContext: AudioContext;
    private analyser!: AnalyserNode;
    private processFrame: (data: Uint8Array) => void;

    constructor(audioContext: AudioContext, processFrame: (data: Uint8Array) => void, processError: () => void) {
        this.audioContext = audioContext;
        this.processFrame = processFrame;

        this.connectStream = this.connectStream.bind(this);
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(this.connectStream)
            .catch(() => {
                if (processError) {
                    processError();
                }
            });
    }

    connectStream(stream: MediaStream) {
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        this.analyser.smoothingTimeConstant = 0.5;
        this.analyser.fftSize = 32;

        this.initRenderLoop();
    }

    initRenderLoop() {
        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        const renderFrame = () => {
            this.analyser.getByteFrequencyData(frequencyData);
            this.processFrame(frequencyData);

            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
    }
}

const Visualizer: React.FC<VisualizerProps> = ({ connectStream }) => {
    const visualValueCount = 16;

    useEffect(() => {
        const visualMainElement = document.querySelector('main') ?? document.createElement('main');
        let visualElements: NodeListOf<HTMLDivElement>;

        const createDOMElements = () => {
            for (let i = 0; i < visualValueCount; ++i) {
                const elm = document.createElement('div');
                visualMainElement.appendChild(elm);
            }

            visualElements = document.querySelectorAll('main div');
        };

        const initDOM = () => {
            visualMainElement.innerHTML = '';
            createDOMElements();
        };

        initDOM();

        const dataMap: { [key: number]: number } = { 0: 15, 1: 10, 2: 8, 3: 9, 4: 6, 5: 5, 6: 2, 7: 1, 8: 0, 9: 4, 10: 3, 11: 7, 12: 11, 13: 12, 14: 13, 15: 14 };
        const processFrame = (data: Uint8Array) => {
            const values = Object.values(data);
            for (let i = 0; i < visualValueCount; ++i) {
                const value = values[dataMap[i]] / 255;
                const elmStyles = visualElements[i].style;
                elmStyles.transform = `scaleY(${value})`;
                elmStyles.opacity = String(Math.max(0.25, value));
                elmStyles.height="100px"
                elmStyles.width="3px"
                elmStyles.background="white"
                elmStyles.margin="0 7px";
            }
        };

        const processError = () => {
            visualMainElement.classList.add('error');
            visualMainElement.innerText = 'Please allow access to your microphone in order to see this demo.\nNothing bad is going to happen... hopefully :P';
        };

        const audioContext = new AudioContext();
        new AudioVisualizer(audioContext, processFrame, processError);

        return () => {

        };
    }, [connectStream]);

    return (
        <main style={{ background: "transparent", height: '102px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {Array.from({ length: visualValueCount }).map((_, index) => (
                <div key={index} />
            ))}
        </main>
    );
};

export default Visualizer;
