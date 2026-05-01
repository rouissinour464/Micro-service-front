pipeline {
    agent any

    triggers {
        githubPush()   // ✅ automatique au push
    }

    environment {
        REGISTRY   = "nour292"
        IMAGE      = "${REGISTRY}/frontend-auth"
        TAG        = "latest"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           BUILD REACT (DANS DOCKER)
        ======================= */
        stage('Build React') {
            steps {
                sh '''
                    set -e
                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20-alpine \
                      sh -c "npm install && npm run build"
                '''
            }
        }

        /* =======================
           DOCKER IMAGE
        ======================= */
        stage('Docker Build') {
            steps {
                sh '''
                    set -e
                    docker build -t ${IMAGE}:${TAG} .
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -e
                        echo "$DOCKER_PASSWORD" | docker login -u ${REGISTRY} --password-stdin
                        docker push ${IMAGE}:${TAG}
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
                    set -e
                    kubectl apply -k k8s
                    kubectl rollout restart deployment frontend-auth -n gestion-projet
                    kubectl rollout status deployment frontend-auth -n gestion-projet --timeout=180s
                '''
            }
        }
    }

    post {
        success {
            echo "✅ FRONTEND DEPLOYED SUCCESSFULLY 🎉"
        }
        failure {
            echo "❌ PIPELINE FAILED ❌"
        }
    }
}
