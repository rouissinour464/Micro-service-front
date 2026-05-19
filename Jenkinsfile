pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        timestamps()
    }

    environment {
        REGISTRY   = "nour292"
        IMAGE      = "${REGISTRY}/frontend-auth"
        TAG        = "${BUILD_NUMBER}"
        NAMESPACE  = "gestion-projet"

        SONAR_PROJECT_KEY = "rouissinour464_micro-service-front"
        SONAR_ORG = "rouissinour464"
    }

    stages {

        /* ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* ✅ TEST UNIQUEMENT */
        stage('Install & Test') {
            steps {
                sh '''
                    set -eux

                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20-alpine \
                      sh -c "
                        npm install &&
                        npm run test -- --watchAll=false
                      "
                '''
            }
        }

        /* ✅ SONAR CORRIGÉ */
        stage('SonarCloud') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        docker run --rm \
                          -v "$PWD:/app" \
                          -w /app \
                          node:20-alpine \
                          sh -c "
                            npm install &&
                            npx sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.organization=${SONAR_ORG} \
                            -Dsonar.host.url=https://sonarcloud.io \
                            -Dsonar.token=$SONAR_TOKEN
                          "
                    '''
                }
            }
        }

        /* ✅ DOCKER = BUILD RÉEL */
        stage('Docker Build & Push') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')]) {
                    sh '''
                        set -eux

                        echo "$DOCKER_PASSWORD" | docker login -u ${REGISTRY} --password-stdin

                        docker build -t ${IMAGE}:${TAG} .
                        docker tag ${IMAGE}:${TAG} ${IMAGE}:latest

                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        /* ✅ CHECK CLUSTER */
        stage('Check Cluster Nodes') {
            steps {
                sh '''
                    set -eux

                    kubectl get nodes
                '''
            }
        }

        /* ✅ DEPLOY */
        stage('Deploy to K3s') {
            steps {
                sh '''
                    set -eux

                    kubectl apply -k k8s/app

                    kubectl rollout restart deployment frontend-auth -n ${NAMESPACE}

                    kubectl rollout status deployment frontend-auth -n ${NAMESPACE}
                '''
            }
        }
    }

    post {

        success {
            echo "✅ FRONTEND PIPELINE SUCCESS 🚀"
        }

        failure {
            echo "❌ PIPELINE FAILED"

            sh '''
                kubectl get pods -n ${NAMESPACE} || true
                kubectl describe pods -n ${NAMESPACE} || true
                kubectl get events -n ${NAMESPACE} || true
            '''
        }

        always {
            cleanWs()
        }
    }
}
