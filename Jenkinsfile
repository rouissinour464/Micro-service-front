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
        TAG        = "${BUILD_NUMBER}"   // ✅ versionné
        NAMESPACE  = "gestion-projet"
    }

    stages {

        /* ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* ✅ INSTALL + TEST */
        stage('Install & Test') {
            steps {
                sh '''
                    set -eux

                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20-alpine \
                      sh -c "
                        npm ci &&
                        npm run test -- --watchAll=false
                      "
                '''
            }
        }

        /* ✅ DOCKER BUILD (fait le build React) */
        stage('Docker Build') {
            steps {
                sh '''
                    set -eux

                    docker build -t ${IMAGE}:${TAG} .
                    docker tag ${IMAGE}:${TAG} ${IMAGE}:latest
                '''
            }
        }

        /* ✅ DOCKER PUSH */
        stage('Docker Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -eux

                        echo "$DOCKER_PASSWORD" | docker login -u ${REGISTRY} --password-stdin

                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        /* ✅ DEPLOY */
        stage('Deploy to K3s') {
            steps {
                sh '''
                    set -eux

                    kubectl apply -k k8s/app

                    kubectl rollout restart deployment frontend-auth -n ${NAMESPACE}

                    kubectl rollout status deployment frontend-auth -n ${NAMESPACE} --timeout=180s
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
            echo "✅ FRONTEND PIPELINE SUCCESS 🚀"
        }

        failure {
            echo "❌ PIPELINE FAILED"
        }

        always {
            cleanWs()
        }
    }
}