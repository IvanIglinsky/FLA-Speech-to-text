import {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {Button, Center, PasswordInput, rem, Text, TextInput, Tooltip} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons-react";
import {useAuth} from "./auth-context.tsx";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [opened, setOpened] = useState(false);
    const auth=useAuth();
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

        if (isAuthenticated) {
            auth.login();
        }
    }, []);
    const valid = password.trim().length >= 6;
    const handleRegistration = async () => {
        try {
            const formData = new FormData();
            formData.append('username',email);
            formData.append('password',password);
            const response = await axios.post('http://localhost:5000/login', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200) {
                auth.login();
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/recorder');
            } else {
                console.error('Login error:', response.statusText);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };
    const rightSection = (
        <Tooltip
            label="We store your data securely"
            position="top-end"
            withArrow
            transitionProps={{ transition: 'pop-bottom-right' }}
        >
            <Text component="div" c="dimmed" style={{ cursor: 'help' }}>
                <Center>
                    <IconInfoCircle style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                </Center>
            </Text>
        </Tooltip>
    );


    return (
        <div className="registration-container">
            <Center maw={1500} miw={800}>
                <div className="registration-form flex justify-center">
                    <Text ta="center"  size="xl"  fw={700} className="text-white">Sign In</Text>
                    <div>
                        <TextInput
                            rightSection={rightSection}
                            label="Email"
                            placeholder="Your email"
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <Tooltip
                        label={valid ? 'All good!' : 'Password must include at least 6 characters'}
                        position="bottom-start"
                        withArrow
                        opened={opened}
                        color={valid ? 'teal' : undefined}
                        withinPortal
                    >
                        <PasswordInput
                            label="Password"
                            required
                            placeholder="Your password"
                            onFocus={() => setOpened(true)}
                            onBlur={() => setOpened(false)}
                            mt="md"

                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </Tooltip>
                    <Button
                        variant="gradient"
                        gradient={{from: 'grape', to: 'blue', deg: 147}}
                        onClick={handleRegistration}
                        fullWidth
                        className="buttonReg"
                    >
                        Sign In
                    </Button>
                </div>
            </Center>
        </div>
    );
};

export default Login;
