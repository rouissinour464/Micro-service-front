pipeline {
    agent any

    triggers {
        githubPush()               // ✅ lancement automatique au push
        cron('H/10 * * * *')       // ✅ toutes les 10 minutes
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

        /* =======================
           SOURCE CODE
        ======================= */
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* =======================
           INSTALL & BUILD REACT
        ======================= */
        stage('Install Dependencies') {
            steps {
                sh '''
                    set -e
                    npm install
                '''
            }
        }

        stage('Build React') {
            steps {
                sh '''
                    set -e
                    npm run build
                '''
            }
        }

        /* =======================
           DOCKER
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
        stage('Deploy to K3s (Kustomize)') {
            steps {
                sh '''
                    set -e
                    echo "Using kubeconfig: $KUBECONFIG"
                    kubectl apply -k k8s
                '''
            }
        }

        stage('Rollout Restart') {
            steps {
                sh '''
                    set -e
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
            echo "❌ FRONTEND PIPELINE FAILED — CHECK LOGS ❌"
        }
    }
}
