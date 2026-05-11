pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    triggers {
        githubPush()
        cron('H */6 * * *')
    }

    tools {
        nodejs 'NODE18'
    }

    environment {
        DOCKER_USER = "nour292"
        IMAGE       = "nour292/react-frontend"
        TAG         = "${BUILD_NUMBER}"
        NAMESPACE   = "gestion-projet"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eux
                    npm ci
                '''
            }
        }

        stage('Tests') {
            steps {
                sh '''
                    set -eux
                    CI=true npm test -- --coverage --watchAll=false
                '''
            }
        }

        stage('Build React') {
            steps {
                sh '''
                    set -eux
                    npm run build
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    set -eux
                    docker build -t ${IMAGE}:${TAG} .
                    docker tag ${IMAGE}:${TAG} ${IMAGE}:latest
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -eux

                        echo "$DOCKER_PASSWORD" | docker login -u ${DOCKER_USER} --password-stdin

                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to K3s') {
            steps {
                sh '''
                    set -eux

                    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

                    kubectl apply -k ./k8s/app
                '''
            }
        }

        stage('Update Deployment Image') {
            steps {
                sh '''
                    set -eux

                    kubectl set image deployment/react-frontend \
                    react-frontend=${IMAGE}:${TAG} \
                    -n ${NAMESPACE}
                '''
            }
        }

        stage('Rollout Status') {
            steps {
                sh '''
                    set -eux

                    kubectl rollout status deployment/react-frontend -n ${NAMESPACE} --timeout=180s
                '''
            }
        }
    }

    post {
        success {
            echo "✅ REACT PIPELINE SUCCESS"
        }

        failure {
            echo "❌ PIPELINE FAILED"
        }

        always {
            cleanWs()
        }
    }
}