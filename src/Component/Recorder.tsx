// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import Visualizer from "./Visualizer.jsx"
import MicrophoneRed from "../assets/microphone-red.png"
import MicrophoneWhite from "../assets/microphone-white.png"


const Recorder = () => {

    const [audioChunks, setAudioChunks] = useState([]);
    const [recording, setRecording] = useState(false);
    let mediaRecorder: MediaRecorder, audioStream: MediaStream, interval: NodeJS.Timeout | undefined;
    const [transcripts,setTranscripts]=useState('');
    const [sentData,setSentData]=useState(false)

    const {
        transcript,
        // listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (recording) {
            startRecording();
            interval = setInterval(() => {
                if (!sentData) {
                    setTranscripts(transcript);
                    console.log(transcript);
                    sendAudioToServer();
                    setSentData(true);
                    resetTranscript();
                }
            }, 6000);
        }

        return () => {
            clearInterval(interval);
            if (audioStream) {
                audioStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [recording]);



    const startRecording = async () => {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstop = handleStop;
            mediaRecorder.start();
            await SpeechRecognition.startListening();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = async () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            await SpeechRecognition.stopListening();
            if (!sentData && transcript.trim() !== '') {
                setTranscripts(transcript);
                console.log(transcript);
                await sendAudioToServer();
                setSentData(true);
                resetTranscript();
            }
        }
    };

    const handleDataAvailable = (event: { data: { size: number; }; }) => {
        if (event.data.size > 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
    };

    const sendAudioToServer = async () => {
        try {
            const audioBuffer = new Uint8Array(
                audioChunks.reduce((acc, chunk) => {
                    const chunkArray = new Uint8Array(chunk);
                    return [...acc, ...Array.from(chunkArray)];
                }, [] as number[])
            );

            const audioBlob = new Blob([audioBuffer], { type: 'audio/webm;codecs=opus' });
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('transcription', transcripts);

            await axios.post('http://localhost:5000/save-audio', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setAudioChunks([]);
        } catch (error) {
            console.error('Error sending audio to the server:', error);
        }
    };

    const handleStop = async () => {
        await stopRecording();

    };
    // const connectStream = (stream: MediaStream) => {
    //     audioStream = stream;
    // };
    const toggleRecording = async () => {
        if (recording) {
            clearInterval(interval);
            await stopRecording();
        } else {
            await startRecording();
        }
        setRecording((prevRecording) => !prevRecording);
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div className="bg-zinc-950 text-white p-4 w-96 h-96 relative rounded-lg shadow-lg shadow-indigo-500/50">
            <div className="transcription-container absolute inset-0 flex items-center justify-center">
                <p className="font-light">{transcript}</p>
            </div>

            <div className="flex flex-col-reverse items-center absolute inset-0 mb-5">
                <button onClick={toggleRecording} className="h-7 w-7">
                    {recording ? <img src={MicrophoneRed} alt=""/> : <img src={MicrophoneWhite} alt=""/>}
                </button>
            </div>
        </div>
    );
};

export default Recorder;
