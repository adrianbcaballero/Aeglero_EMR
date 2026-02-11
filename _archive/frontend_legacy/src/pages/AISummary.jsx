import React, { useEffect, useState} from 'react';
import '../styles/Student.css'
import { Card, CardBody, CardFooter, CardHeader, Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const AISummary = () => {
    const [summary, setSummary] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // const summ = localStorage.getItem("ai_summary");
        const summ = localStorage.getItem("ai_summ");
        if(summ){
            setSummary(summ);
        }
    }, []);

    return(
        <div className='snt'>
            <Card className='snt-card'>
                <CardHeader className='snt-card-header'>
                <h2 className='snt-desc-text'> AI Summary</h2>
                </CardHeader>
                <CardBody className='snt-card-body'>
                    
                    <p className='snt-desc-text-small'>{summary}</p>

                </CardBody>
                <CardFooter className='snt-card-footer' style={{justifyContent: 'center'}}>
                    <Button className="snt-button" onPress={() => navigate("/")}>
                    <h2 className='snt-desc-text'> Done </h2>
                    </Button>

                </CardFooter>
            </Card>

        </div>

    );
};

export default AISummary;