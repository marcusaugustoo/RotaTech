import { useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
                    <div className="h-0.5 w-16 bg-primary/30 mx-auto"></div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-medium">Página não encontrada</h2>
                    <p className="text-muted-foreground">
                        A página <span className="font-medium text-foreground">"{pageName}"</span> não existe.
                    </p>
                </div>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    <Zap className="w-4 h-4 mr-2" />
                    Voltar ao Início
                </Button>
            </div>
        </div>
    )
}