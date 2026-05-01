pipeline {
    agent {
        docker {
            image 'node:20-alpine'   // ✅ Node + npm inclus
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    triggers {
        githubPush()   // ✅ lancement automatique au push
    }

    environment {
        REGISTRY   = "nour292"
        IMAGE      = "${REGISTRY}/frontend-auth"
        TAG        = "latest"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }

    options {
        timestamps()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build React') {
            steps {
                sh '''
                    set -e
                    npm install
                    npm run build
                '''
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'dockerhub-pass', variable: 'DOCKER_PASSWORD')
                ]) {
                    sh '''
                        set -e
                        echo "$DOCKER_PASSWORD" | docker login -u ${REGISTRY} --password-stdin
                        docker build -t ${IMAGE}:${TAG} .
                        docker push ${IMAGE}:${TAG}
                    '''
                }
            }
        }

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
