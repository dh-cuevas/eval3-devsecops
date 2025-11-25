// JENKINSFILE - PIPELINE CI/CD
// AUTOR: DAVID H. CUEVAS SALGADO
// 3era Evaluación - Ciberseguridad en Desarrollo

pipeline {
    agent any
    
    environment {
        APP_NAME = "vulnerable-app"
        DOCKER_IMAGE = "${APP_NAME}:${BUILD_NUMBER}"
        APP_URL = "http://app:5000"
    }
    
    stages {
        stage("Checkout") {
            steps {
                script {
                    echo "--- ETAPA 1: CHECKOUT ---"
                    echo "Obteniendo código desde repositorio..."
                }
                checkout scm
            }
        }
        
        stage("Build Docker Image") {
            steps {
                script {
                    echo "--- ETAPA 2: BUILD ---"
                    echo "Construyendo imagen Docker de Flask..."
                    dir("app") {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                    }
                }
            }
        }
        
        stage("Start Service") {
            steps {
                script {
                    echo "--- ETAPA 3: START SERVICE ---"
                    // Levanta todos los servicios para que Jenkins y app compartan red
                    sh "docker compose up -d --force-recreate"
                    sh "docker compose ps > compose_ps.txt"
                }
            }
        }
        
        stage("Health Check") {
            steps {
                script {
                    echo "--- ETAPA 4: HEALTH CHECK ---"
                    def maxRetries = 5
                    def success = false
                    for (int i = 1; i <= maxRetries; i++) {
                        try {
                            sh "curl -sS ${APP_URL}"
                            success = true
                            break
                        } catch (Exception e) {
                            echo "Intento ${i}: servicio no responde aún"
                            sleep 3
                        }
                    }
                    if (!success) {
                        echo "Health check falló"
                        error("Servicio no disponible")
                    }
                }
            }
        }
        
        stage("Evidence") {
            steps {
                script {
                    echo "--- ETAPA 5: EVIDENCE ---"
                    sh "docker logs ${APP_NAME} > app_logs.txt || true"
                }
                archiveArtifacts artifacts: "compose_ps.txt, app_logs.txt", fingerprint: true
            }
        }
    }
    
    post {
        always {
            echo "--- PIPELINE COMPLETADO ---"
            echo "Documentar resultados en docs/reportes/"
        }
        success {
            echo "Pipeline ejecutado con éxito"
        }
        failure {
            echo "Pipeline falló – revisar compose_ps.txt y app_logs.txt"
        }
    }
}
