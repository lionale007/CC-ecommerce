pipeline {
    agent any

    stages {
        stage('Clone Repository') {
            steps {
                // Clone the GitHub repository
                git 'https://github.com/ShafiudeenKameel/CC-ecommerce.git'
            }
        }
        stage('Deploy MongoDB') {
            steps {
                // Deploy MongoDB using kubectl
                bat 'kubectl apply -f mongodb/deployment.yaml'
                bat 'kubectl apply -f mongodb/service.yaml'
            }
        }
        stage('Deploy RabbitMQ') {
            steps {
                // Deploy RabbitMQ using kubectl
                bat 'kubectl apply -f rabbitmq/deployment.yaml'
                bat 'kubectl apply -f rabbitmq/service.yaml'
            }
        }
        stage('Build and Deploy Microservices') {
            steps {
                // Build Docker images for each microservice
                dir('user-microservice'){
                   bat 'docker build -t user-microservice:4 .'
                    bat 'kubectl apply -f user-microservice-deployment.yaml'
                    bat 'kubectl apply -f user-microservice-service.yaml'   
                }

                dir('product-mircoservice'){
                    bat 'docker build -t product-microservice:3 .'
                    bat 'kubectl apply -f product-microservice-deployment.yaml'
                    bat 'kubectl apply -f product-microservice-service.yaml'

                }

                dir('order-microservice'){
                    bat 'docker build -t order-microservice:3 .'
                    bat 'kubectl apply -f order-microservice-deployment.yaml'
                    bat 'kubectl apply -f order-microservice-service.yaml'
                }            
            }
        }
        stage('Port Forwarding') {
            steps {
                // Port forward each microservice for local testing
                bat 'kubectl port-forward services/user-microservice 7070:7070'
                bat 'kubectl port-forward services/product-microservice 8080:8080'
                bat 'kubectl port-forward services/order-microservice 9090:9090'
            }
        }
    }

    post {
        always {
            // Clean up port forwarding processes
            bat 'pkill -f "kubectl port-forward"'
        }
    }
}
