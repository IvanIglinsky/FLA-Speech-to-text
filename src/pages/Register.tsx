import { useState } from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {Button, Center, Text, TextInput} from "@mantine/core";
import {PasswordStrength} from "../Component/PasswordField.tsx";
import "../styles/Registration.css"
import { useAuth } from './auth-context.tsx';
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();
    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
    };
    const handleRegistration = async () => {
        console.log(password, email)
        try {
            const response = await axios.post(
                'http://localhost:5000/register',
                {
                    email: email,
                    password: password
                },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log(response);
            auth.login();
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/recorder');
        } catch (error) {
            console.error('Sign Up error:', error);
        }
    };

    return (
        <div className="registration-container">
            <Center maw={1500} miw={800}>
                <div className="registration-form flex justify-center">
                    <Text ta="center"  size="xl"  fw={700} className="text-white">Sign Up</Text>
                    <div>
                        <TextInput
                            label="Email"
                            placeholder="Your email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <PasswordStrength onPasswordChange={handlePasswordChange}/>
                    <Button
                        variant="gradient"
                        gradient={{from: 'grape', to: 'blue', deg: 147}}
                        onClick={handleRegistration}
                        fullWidth
                        className="buttonReg"
                    >
                        Sign Up
                    </Button>
                </div>
            </Center>
        </div>
    );
};

export default Register;
