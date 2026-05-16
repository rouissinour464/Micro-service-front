pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        REGISTRY   = "nour292"
        IMAGE      = "${REGISTRY}/frontend-auth"
        TAG        = "latest"
        NAMESPACE  = "gestion-projet"
    }

    options {
        timestamps()
    }

    stages {

        /* =======================
           CHECKOUT
        ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           INSTALL + TESTS (Docker Node)
        ======================= */
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

        /* =======================
           BUILD REACT
        ======================= */
        stage('Build React') {
            steps {
                sh '''
                    set -eux

                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20-alpine \
sh -c "npm install && npm install @csstools/normalize.css && npm run build"                '''
            }
        }

        /* =======================
           DOCKER BUILD
        ======================= */
        stage('Docker Build') {
            steps {
                sh '''
                    set -eux

                    docker build -t ${IMAGE}:${TAG} .
                '''
            }
        }

        /* =======================
           DOCKER PUSH
        ======================= */
        stage('Docker Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -eux

                        echo "$DOCKER_PASSWORD" | docker login -u ${REGISTRY} --password-stdin

                        docker push ${IMAGE}:${TAG}

                        docker logout
                    '''
                }
            }
        }

        /* =======================
           DEPLOY K3S
        ======================= */
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
    }

    post {
        success {
            echo "✅ FRONTEND PIPELINE SUCCESS (BUILD + TEST + DEPLOY)"
        }

        failure {
            echo "❌ PIPELINE FAILED"
        }

        always {
            cleanWs()
        }
    }
}