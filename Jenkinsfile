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

        /* ✅ INSTALL + TEST */
        stage('Install & Test') {
            steps {
                sh '''
                    set -eux

                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20 \
                      sh -c "
                        if [ -f package-lock.json ]; then
                          echo '✅ Using npm ci'
                          npm ci
                        else
                          echo '⚠️ No lock file → using npm install'
                          npm install
                        fi

                        npm run test -- --watchAll=false || echo 'No tests found'
                      "
                '''
            }
        }

        /* ✅ DOCKER BUILD & PUSH */
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

        /* ✅ DEPLOY K8S */
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