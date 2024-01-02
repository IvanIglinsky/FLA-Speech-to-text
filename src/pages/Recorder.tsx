import React, {useState, useEffect} from 'react';
import axios from 'axios';
import "regenerator-runtime/runtime";
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import Visualizer from "../Component/Visualizer.tsx"
import MicrophoneRed from "../assets/microphone-red.png"
import MicrophoneWhite from "../assets/microphone-white.png"
import Pause from "../assets/pause.png"
import Settings from "../assets/settings.png"
import {useAuth} from "./auth-context.tsx";
import "../styles/Recorder.css"

const Recorder = () => {
    const auth = useAuth();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
        auth.login();
    }
    const [audioChunks, setAudioChunks] = useState([]);
    const [recording, setRecording] = useState(false);
    let mediaRecorder: MediaRecorder, audioStream: MediaStream, interval: NodeJS.Timeout | undefined;
    const [transcripts, setTranscripts] = useState('');
    const [sentData, setSentData] = useState(false)
    const [selectedOption, setSelectedOption] = useState('');
    const [options, setOptions] = useState([]);
    const {
        transcript,
        // listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    useEffect(() => {
        axios.get('http://localhost:5000/options')
            .then(response => {
                console.log(response.data[0].option)
                setOptions(response.data);
            })
            .catch(error => {
                console.error('Error fetching options:', error);
            });
    }, []);

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
            audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
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

            const audioBlob = new Blob([audioBuffer], {type: 'audio/webm;codecs=opus'});
            const formData = new FormData();
            formData.append('audio', audioBlob);
            console.log(transcript)
            console.log(transcripts)
            formData.append('transcription', transcripts);
            formData.append("script",selectedOption);
            await axios.post('http://localhost:5000/save-audio', formData, {
                withCredentials: true,
                headers: {'Content-Type': 'multipart/form-data'},
            });

            setAudioChunks([]);
        } catch (error) {
            console.error('Error sending audio to the server:', error);
        }
    };

    const handleStop = async () => {
        await stopRecording();

    };
    const connectStream = (stream: MediaStream) => {
        audioStream = stream;
    };
    const toggleRecording = async () => {
        if (recording) {
            clearInterval(interval);
            await stopRecording();
        } else {
            await startRecording();
        }
        setRecording((prevRecording) => !prevRecording);
    };
    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);

    };
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <div
            className="neon-container bg-zinc-950 text-white p-4 w-96 relative"
            style={{height: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
        >
            <div className="flex items-center justify-center mt-8">
            <textarea
                style={{background: 'transparent', width: '90%'}}
                className="font-light text-center"
                onChange={(event) => setTranscripts(event.target.value)}
                value={transcript}
            />
            </div>
            <Visualizer connectStream={connectStream}/>
            <div className="d-flex w-full justify-center">
                <select value={selectedOption} onChange={handleDropdownChange} style={{background: "transparent"}}
                        className="border border-amber-700 rounded-2xl h-10 px-4 select-container">
                    {options.map((option) => (
                        <option key={option["id"]} value={option["id"]} style={{background: "black"}}>
                            {option["option"]}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-between items-center mb-3 border  rounded-2xl border-gray-500 p-3">
                <button  className="h-7 w-7">
                    <img src={Pause} alt=""/>
                </button>
                <button onClick={toggleRecording} className="h-7 w-7">
                    {recording ? <img src={MicrophoneRed} alt=""/> : <img src={MicrophoneWhite} alt=""/>}
                </button>
                <button  className="h-7 w-7">
                     <img src={Settings} alt=""/>
                </button>
            </div>
        </div>
    );
};

export default Recorder;
