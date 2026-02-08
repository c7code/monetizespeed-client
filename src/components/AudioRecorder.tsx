import React, { useState, useRef } from 'react';
import { useAuth } from '../store/auth';
import { apiUrl } from '../config/api';

interface AudioRecorderProps {
    onTranscriptionComplete: (data: any) => void;
}

export default function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const { token } = useAuth();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);

                // Parar todas as tracks do stream para liberar o microfone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
            alert('Não foi possível acessar o microfone.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            setProcessing(true);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch(apiUrl('/audio/transaction'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro ao processar áudio');
            }

            const result = await response.json();
            console.log('Resultado do áudio:', result);

            if (result.data) {
                onTranscriptionComplete(result.data);
            }
        } catch (error) {
            console.error('Erro ao enviar áudio:', error);
            alert('Erro ao processar o áudio. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {!recording && !processing && (
                <button
                    onClick={startRecording}
                    className="flex items-center justify-center bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors text-sm"
                    type="button"
                    title="Gravar transação por voz"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
            )}

            {recording && (
                <button
                    onClick={stopRecording}
                    className="flex items-center justify-center bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors text-sm animate-pulse"
                    type="button"
                    title="Parar gravação"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                </button>
            )}

            {processing && (
                <div className="flex items-center justify-center text-gray-600 bg-gray-100 rounded-full p-2 text-sm" title="Processando...">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
}
