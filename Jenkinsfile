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
        jdk 'JDK21'
    }

    environment {
        REGISTRY   = "nour292"
        IMAGE      = "${REGISTRY}/auth-service"
        TAG        = "latest"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }

    stages {

        /* =======================
           SOURCE CODE
        ======================= */
        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    set -eux

                    echo "===== CURRENT DIRECTORY ====="
                    pwd

                    echo "===== FILES ====="
                    ls -la

                    echo "===== SEARCH MVNW ====="
                    find . -name mvnw || true
                '''
            }
        }

        /* =======================
           BUILD
        ======================= */
        stage('Build') {
            steps {
                sh '''
                    set -eux

                    chmod +x mvnw

                    ./mvnw clean compile
                '''
            }
        }

        /* =======================
           UNIT TESTS
        ======================= */
        stage('Unit Tests') {
            steps {
                sh '''
                    set -eux

                    ./mvnw test
                '''
            }
        }

        /* =======================
           INTEGRATION TESTS
        ======================= */
        stage('Integration Tests') {
            steps {
                sh '''
                    set -eux

                    ./mvnw verify
                '''
            }
        }

        /* =======================
           PACKAGE JAR
        ======================= */
        stage('Package') {
            steps {
                sh '''
                    set -eux

                    ./mvnw clean package -DskipTests
                '''
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
           VERIFY K8S FILES
        ======================= */
        stage('Verify K8s Files') {
            steps {
                sh '''
                    set -eux

                    ls -R k8s

                    test -d k8s/app
                    test -f k8s/app/kustomization.yaml
                '''
            }
        }

        /* =======================
           DEPLOY APPLICATION
        ======================= */
        stage('Deploy Application (K3s)') {
            steps {
                sh '''
                    set -eux

                    kubectl apply -k k8s/app

                    kubectl get pods -n gestion-projet
                '''
            }
        }

        /* =======================
           RESTART AUTH SERVICE
        ======================= */
        stage('Restart Auth Service') {
            steps {
                sh '''
                    set -eux

                    kubectl rollout restart deployment auth-deployment -n gestion-projet

                    kubectl rollout status deployment auth-deployment -n gestion-projet --timeout=180s
                '''
            }
        }

        /* =======================
           DEPLOY MONITORING
        ======================= */
        stage('Deploy Monitoring') {
            steps {
                sh '''
                    set -eux

                    kubectl apply -k k8s/monitoring

                    kubectl get pods -n monitoring

                    kubectl get pvc -n monitoring
                '''
            }
        }

        /* =======================
           RESTART MONITORING
        ======================= */
        stage('Restart Monitoring') {
            steps {
                sh '''
                    set -eux

                    kubectl rollout restart deployment prometheus -n monitoring

                    kubectl rollout status deployment prometheus -n monitoring --timeout=180s

                    kubectl rollout restart deployment alertmanager -n monitoring

                    kubectl rollout status deployment alertmanager -n monitoring --timeout=180s

                    kubectl rollout restart deployment grafana -n monitoring

                    kubectl rollout status deployment grafana -n monitoring --timeout=180s
                '''
            }
        }
    }

    post {

        success {
            echo "✅ BUILD + TESTS + DEPLOY + MONITORING SUCCESS 🚀"
        }

        failure {
            echo "❌ PIPELINE FAILED (Tests / Build / Deploy)"
        }

        always {
            cleanWs()
        }
    }
}