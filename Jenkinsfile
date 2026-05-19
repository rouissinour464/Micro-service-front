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
    }

    stages {

        /* ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* ✅ TEST */
        stage('Install & Test') {
            steps {
                sh '''
                    set -eux

                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20 \
                      sh -c "
                        npm ci &&
                        npm run test -- --watchAll=false
                      "
                '''
            }
        }

        /* ✅ DOCKER */
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

        /* ✅ DEPLOY */
        stage('Deploy') {
            steps {
                sh '''
                    set -eux

                    kubectl apply -k k8s/app

                    kubectl rollout restart deployment frontend-auth -n ${NAMESPACE}

                    kubectl rollout status deployment frontend-auth -n ${NAMESPACE}
                '''
            }
        }

        /* ✅ CHECK */
        stage('Check Pods') {
            steps {
                sh '''
                    kubectl get pods -n ${NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ FRONTEND PIPELINE (FAST & CLEAN) 🚀"
        }

        failure {
            echo "❌ PIPELINE FAILED"
        }

        always {
            cleanWs()
        }
    }
}