import express, { Request, Response } from 'express';
import mongoose, {Schema, Document, model} from 'mongoose';
import multer from 'multer';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.options('*', cors());
mongoose.connect('mongodb+srv://ivan:i1uUaS4KTLXTxHDT@cluster0.l82k2ji.mongodb.net/Speech_to_text', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});

const corsOptions ={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200,
}
app.use(cors(corsOptions))
app.use(express.json());
interface AudioData extends Document {
    audio: { data: Buffer };
    transcription: string;
    createdAt: Date;
}
interface User extends Document {
    email: string;
    password: string;
}

const UserModel = mongoose.model<User>('User', new mongoose.Schema({
    email: String,
    password: String,
}));

const MinuteAudioDataSchema = new Schema<AudioData>({
    audio: { data: Buffer },
    transcription: String,
    createdAt: { type: Date, default: Date.now },
});

const MinuteAudioData = model<AudioData>('MinuteAudioData', MinuteAudioDataSchema);

const HourlyAudioDataSchema = new Schema<AudioData>({
    audio: { data: Buffer, contentType: String },
    createdAt: { type: Date, default: Date.now },
});

const HourlyAudioData = model<AudioData>('HourlyAudioData', HourlyAudioDataSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/save-audio', upload.single('audio'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided.' });
        }

        const { buffer, mimetype } = req.file;
        const transcription = req.body.transcription || '';
        await MinuteAudioData.create({ audio: { data: buffer, contentType: mimetype }, transcription });

        const currentTime = new Date();
        if (currentTime.getMinutes() % 6 === 0) {
            await HourlyAudioData.create({ audio: { data: buffer, contentType: mimetype } });
        }

        res.status(200).json({ message: 'Audio file saved successfully.' });
    } catch (error) {
        console.error('Error saving audio file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/register', upload.none(), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log('Email:', email.value);
        console.log('Password:', password.value);
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const newUser = new UserModel({ email, password });
        await newUser.save();
        res.status(201).json({ message: 'Sign Up successful' });
    } catch (error) {
        console.error('Sign Up error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
