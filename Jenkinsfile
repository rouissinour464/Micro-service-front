pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        REGISTRY           = "nour292"
        IMAGE              = "${REGISTRY}/frontend-auth"
        TAG                = "${BUILD_NUMBER}"
        NAMESPACE          = "gestion-projet"
        ROLLOUT_NAME       = "frontend-auth"
        GIT_CREDENTIALS_ID = "github-creds"
        GIT_USER_EMAIL     = "jenkins@ci.local"
        GIT_USER_NAME      = "Jenkins CI"
    }

    stages {

        // ─────────────────────────────────────────
        // 1. Checkout du code source frontend
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────
        // 2. Tests unitaires React
        // ─────────────────────────────────────────
        stage('Test') {
            steps {
                sh '''
                    set -eux
                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      node:20-alpine \
                      sh -c "npm install && npm run test -- --watchAll=false"
                '''
            }
        }

        // ─────────────────────────────────────────
        // 3. Build image Docker + push Docker Hub
        // ─────────────────────────────────────────
        stage('Docker Build & Push') {
            steps {
                withCredentials([string(
                    credentialsId: 'dockerhub-pass',
                    variable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        set -eux
                        docker build -t ${IMAGE}:${TAG} .
                        docker tag  ${IMAGE}:${TAG} ${IMAGE}:latest

                        echo "$DOCKER_PASSWORD" | \
                            docker login -u ${REGISTRY} --password-stdin

                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:latest
                        docker logout

                        docker rmi ${IMAGE}:${TAG} ${IMAGE}:latest || true
                    '''
                }
            }
        }

        // ─────────────────────────────────────────
        // 4. Mettre à jour kustomization.yaml dans Git
        //    → ArgoCD détecte le changement et sync
        //    → Le Rollout démarre automatiquement
        // ─────────────────────────────────────────
        stage('Update Git → ArgoCD Sync') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${GIT_CREDENTIALS_ID}",
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        set -eux
                        git config user.email "${GIT_USER_EMAIL}"
                        git config user.name  "${GIT_USER_NAME}"

                        git checkout -B v2

                        # Mettre à jour le tag image dans kustomization.yaml
                        # Fichier : Micro-service-front/k8s/app/kustomization.yaml
                        sed -i "s|newTag:.*|newTag: \\"${TAG}\\"|g" \
                            k8s/app/kustomization.yaml

                        git add k8s/app/kustomization.yaml

                        # Si pas de changement, skip
                        git diff --cached --quiet && \
                            echo "Pas de changement Git — skip" && exit 0

                        git commit -m "ci: frontend-auth image → ${TAG} [skip ci]"

                        REMOTE=$(git remote get-url origin \
                            | sed "s|https://|https://${GIT_USER}:${GIT_TOKEN}@|")

                        git push "$REMOTE" HEAD:v2 --force-with-lease

                        echo "Git mis à jour — ArgoCD va sync automatiquement"
                    '''
                }
            }
        }

        // ─────────────────────────────────────────
        // 5. Attendre qu'ArgoCD sync et que le
        //    Rollout Canary démarre (pod canary up)
        // ─────────────────────────────────────────
        stage('Wait Canary Pod') {
            steps {
                sh '''
                    set -eux
                    echo "Attente sync ArgoCD (40s)..."
                    sleep 40

                    echo "État du Rollout :"
                    kubectl argo rollouts get rollout ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    # Attendre que le pod canary soit Running (max 3 min)
                    READY=false
                    for i in $(seq 1 36); do
                        CANARY_RUNNING=$(kubectl get pods -n ${NAMESPACE} \
                            -l app=${ROLLOUT_NAME} \
                            --field-selector=status.phase=Running \
                            --no-headers 2>/dev/null | wc -l)

                        echo "Pods Running : $CANARY_RUNNING / tentative $i"

                        if [ "$CANARY_RUNNING" -ge 1 ]; then
                            READY=true
                            break
                        fi
                        sleep 5
                    done

                    if [ "$READY" = "false" ]; then
                        echo "Pod canary pas Running après 3 min"
                        exit 1
                    fi

                    echo "Pod canary Running — prêt pour promotion"
                '''
            }
        }

        // ─────────────────────────────────────────
        // 6. Promotion Canary : 20% → 50% → 100%
        //    (pause: {duration: 30s} entre chaque)
        // ─────────────────────────────────────────
        stage('Promote Canary 20% → 50%') {
            steps {
                sh '''
                    set -eux
                    echo "Promotion canary : 20% → 50%"
                    kubectl argo rollouts promote ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    echo "Attente pause 2 min à 50%..."
                    sleep 130

                    echo "État à 50% :"
                    kubectl argo rollouts get rollout ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}
                '''
            }
        }

        stage('Promote Canary 50% → 100%') {
            steps {
                sh '''
                    set -eux
                    echo "Promotion canary : 50% → 100%"
                    kubectl argo rollouts promote ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    # Attendre que le Rollout soit Healthy
                    echo "Attente Healthy..."
                    for i in $(seq 1 30); do
                        STATUS=$(kubectl argo rollouts get rollout \
                            ${ROLLOUT_NAME} -n ${NAMESPACE} \
                            | grep "Status:" | awk "{print \$2}")

                        echo "Status : $STATUS (tentative $i)"

                        if [ "$STATUS" = "Healthy" ]; then
                            echo "Rollout Healthy"
                            break
                        fi
                        sleep 10
                    done
                '''
            }
        }

        // ─────────────────────────────────────────
        // 7. Vérification finale
        // ─────────────────────────────────────────
        stage('Verify') {
            steps {
                sh '''
                    echo "=== Rollout final ==="
                    kubectl argo rollouts get rollout ${ROLLOUT_NAME} \
                        -n ${NAMESPACE}

                    echo "=== Pods frontend ==="
                    kubectl get pods -n ${NAMESPACE} \
                        -l app=${ROLLOUT_NAME}

                    echo "=== Services ==="
                    kubectl get svc -n ${NAMESPACE} | grep frontend

                    echo "=== ArgoCD Application ==="
                    kubectl get application frontend-auth -n argocd
                '''
            }
        }
    }

    post {
        success {
            echo "SUCCES — frontend-auth:${TAG} déployé en production"
        }

        failure {
            sh '''
                echo "=== ROLLBACK automatique ==="
                kubectl argo rollouts abort ${ROLLOUT_NAME} \
                    -n ${NAMESPACE} || true

                echo "=== État après abort ==="
                kubectl argo rollouts get rollout ${ROLLOUT_NAME} \
                    -n ${NAMESPACE} || true

                echo "=== Logs pod canary ==="
                kubectl get pods -n ${NAMESPACE} \
                    -l app=${ROLLOUT_NAME} --no-headers \
                    | awk "{print \$1}" \
                    | head -1 \
                    | xargs -I{} kubectl logs {} \
                        -n ${NAMESPACE} \
                        -c frontend-auth \
                        --tail=50 || true

                echo "=== Events ==="
                kubectl get events -n ${NAMESPACE} \
                    --sort-by=.lastTimestamp | tail -20 || true
            '''
        }

        always {
            cleanWs()
        }
    }
}