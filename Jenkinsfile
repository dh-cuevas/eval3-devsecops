// JENKINSFILE - PIPELINE CI/CD
// AUTOR: DAVID H. CUEVAS SALGADO
// 3era Evaluación - Ciberseguridad en Desarrollo

pipeline {
    agent any
    
    environment {
        APP_NAME = 'vulnerable-app'
        DOCKER_IMAGE = "${APP_NAME}:${BUILD_NUMBER}"
        ZAP_URL = 'http://owasp-zap:8090'
        APP_URL = 'http://app:3000'
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
        
        stage("Análisis de Dependencias") {
            steps {
                script {
                    echo "--- ETAPA 2: ANÁLISIS DE DEPENDENCIAS ---"
                    dir("app") {
                        sh "npm audit --json > ../docs/reportes/npm-audit.json || true"
                        sh "npm audit"
                    }
                }
            }
        }
        
        stage("Build") {
            steps {
                script {
                    echo "--- ETAPA 3: BUILD ---"
                    echo "Construyendo imagen Docker..."
                    dir("app") {
                        sh "docker build -t ${DOCKER_IMAGE} ."
                    }
                }
            }
        }
        
        stage("Tests Unitarios") {
            steps {
                script {
                    echo "--- ETAPA 4: TESTS UNITARIOS ---"
                    dir("app") {
                        sh "npm install"
                        sh "npm test || true"
                    }
                }
            }
        }
        
        stage("OWASP ZAP Scan") {
            steps {
                script {
                    echo "--- ETAPA 5: ESCANEO DE SEGURIDAD CON OWASP ZAP ---"
                    
                    sh "docker run -d --name test-app --network eval3-devsecops_devsecops-net -p 3002:3000 ${DOCKER_IMAGE}"
                    sleep(time: 10, unit: "SECONDS")
                    
                    sh @"
                        docker run --rm --network eval3-devsecops_devsecops-net \
                        zaproxy/zap-stable zap-baseline.py \
                        -t http://test-app:3000 \
                        -r zap-report.html || true
"@
                    
                    sh "docker stop test-app && docker rm test-app"
                }
            }
        }
        
        stage("Deploy to Production") {
            steps {
                script {
                    echo "--- ETAPA 6: DESPLIEGUE A PRODUCCIÓN ---"
                    
                    sh "docker stop vulnerable-app || true"
                    sh "docker rm vulnerable-app || true"
                    
                    sh @"
                        docker run -d \
                        --name vulnerable-app \
                        --network eval3-devsecops_devsecops-net \
                        -p 3000:3000 \
                        ${DOCKER_IMAGE}
"@
                    
                    echo "Aplicación desplegada en http://localhost:3000"
                }
            }
        }
        
        stage("Monitoreo Post-Deploy") {
            steps {
                script {
                    echo "--- ETAPA 7: VERIFICACIÓN DE MONITOREO ---"
                    echo "Grafana: http://localhost:3001"
                    echo "Prometheus: http://localhost:9090"
                    sleep(time: 5, unit: "SECONDS")
                }
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
            echo "Pipeline falló – hay que revisar los logs"
        }
    }
}
