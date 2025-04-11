# ProJect_Calico
Đánh Giá Hiệu Năng Mạng Máy Tính 


# Project Calico

<img src="Calico_Ghibli.png" alt="Calico" width="500"/>


## Tổng quan

Project Calico là một giải pháp mạng và bảo mật mã nguồn mở, được thiết kế để cung cấp kiến trúc mạng phân tán, quản lý và kiểm soát lưu lượng giữa các pods, máy ảo (VMs), và hosts một cách an toàn, hiệu quả trong môi trường Kubernetes, Docker và OpenStack.

## Kiến trúc

Calico sử dụng mô hình định tuyến IP trực tiếp (pure IP networking) và chính sách mạng (Network Policies) để quản lý traffic một cách linh hoạt, hiệu quả, và bảo mật cao. Calico tích hợp mượt mà với các nền tảng orchestrator container phổ biến như Kubernetes.

## Tính năng chính

### 1. Chính sách mạng (Network Policy)
- Quản lý traffic giữa các ứng dụng.
- Áp dụng mô hình Zero Trust: chỉ cho phép các kết nối xác thực.
- Cấu hình chi tiết theo nguồn, đích, cổng, giao thức.

### 2. Routing & Quản lý IP
- Định tuyến lưu lượng dựa trên IP, đơn giản hóa việc quản lý mạng.

### 3. Tích hợp orchestrators
- Hỗ trợ Kubernetes, Docker, OpenStack.
- Tự động hóa triển khai và cấu hình mạng.

### 4. Bảo mật nâng cao
- Mã hóa lưu lượng.
- Kiểm tra, phát hiện bất thường.
- Tích hợp hệ thống SIEM để giám sát và cảnh báo.

### 5. Quan sát (Observability)
- Logging tập trung, theo dõi toàn diện traffic mạng.
- Giám sát hiệu năng (Prometheus, Grafana).
- Hỗ trợ tracing, phân tích sự cố nhanh chóng.
- Cảnh báo tự động khi có vấn đề xảy ra.

### 6. Networking mạnh mẽ
- Định tuyến tối ưu, giảm độ trễ.
- Load Balancing thông minh.
- Áp dụng chính sách Quality of Service (QoS).
- Hỗ trợ đa giao thức (TCP, UDP, SCTP).

## Triển khai và Demo

### Chuẩn bị môi trường
- Cluster Kubernetes (tối thiểu 3 nodes).
- Hệ điều hành: Ubuntu/CentOS/RHEL.
- Container runtime: Docker/containerd.
- Triển khai Calico bằng YAML hoặc Helm.

### Triển khai ứng dụng mẫu
- Ứng dụng bảo mật (app-secure): Pod nginx với label role=trusted.
- Ứng dụng mô phỏng attacker: Pod busybox không có label trusted.

### Áp dụng Network Policy
- Chính sách cho phép pod trusted truy cập vào app-secure.
- Chính sách chặn pod attacker.

### Kiểm thử
- Kiểm tra truy cập hợp lệ và trái phép.
- Xác thực tính hiệu quả của các Network Policies.

### Giám sát và Log
- Sử dụng OpenTelemetry để thu thập logs và metrics.
- Hiển thị logs và metrics trên Grafana.
- Cấu hình cảnh báo tự động khi có vấn đề.

## Hướng dẫn sử dụng

### Lệnh Calico thường dùng
- `calicoctl get nodes`: xem nodes Calico quản lý.
- `calicoctl get networkpolicy`: xem policies đang áp dụng.
- `calicoctl ipam show`: xem IP pool và trạng thái cấp phát IP.

### Truy cập vào Pod
- Vào pod kiểm tra connectivity:
```bash
kubectl exec -it <pod-name> -- sh
```

# Project Calico - Demo

## 1. Mục Đích
Trình bày một demo về bảo mật mạng trong Kubernetes sử dụng **Calico NetworkPolicy** kèm theo giám sát logs qua **OpenTelemetry Collector** và **Grafana Loki**.

---

## 2. Kiến trúc demo

```
trusted-client --> app-secure (nginx)
attacker ------> app-secure (bị chặn)
                         |
OpenTelemetry Collector --> Loki --> Grafana
```

- 3 Node Minikube: control-plane + 2 workers
- Namespace: `networking-policy-demo`

---

## 3. Cài đặt Calico

```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.3/manifests/tigera-operator.yaml
kubectl apply -f custom-resources.yaml
```
`custom-resources.yaml` bao gồm:
- `Installation`: config VXLAN, IPPool CIDR
- `APIServer`: bật Calico API server

Hoặc

```bash
minikube start --nodes=3 --cni=calico
```
- Cài đặt minikube tại đường dẫn: [ Truy cập trang chính thức của minkube tại đây.](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download)


---

## 4. Tạo Pod Demo

- `app-secure`: nginx, label: `app=app-secure`
- `attacker`: busybox, label: `app=attacker`
- `trusted-client`: busybox, label: `run=access`

Triển khai bằng YAML Pod hoặc deployment.

---

## 5. Viết NetworkPolicy

### 5.1 Chặn attacker truy cập app-secure
- Dùng file `deny-busybox-ingress.yaml` để áp dụng chính sách
```bash
calicoctl apply -f deny-busybox-ingress.yaml
```

### 5.2 Cho trusted-client đi ra ngoài

- Dùng file `allow-busybox-egress.yaml` để áp dụng chính sách
```bash
calicoctl apply -f allow-busybox-egress.yaml
```

---

## 6. Cài OpenTelemetry Collector

### ConfigMap: `otel-config.yaml`
- Dùng file `otel-config.yaml` trong thư mục OpenTelemetry
```bash
kubectl apply -f otel-config.yaml
```

Triển khai cùng deployment otel-collector.
- Dùng file `otel-collector-deployment.yaml` trong thư mục OpenTelemetry
```bash
kubectl apply -f otel-collector-deployment.yaml
```


---

## 7. Cài Grafana + Loki
- Để cài đặt Grafana + Loki trước hết bạn phải cài đặt helm tại đường dẫn này: link [Tải helm từ trang chính thức](https://helm.sh/docs/intro/install/)
|| Sau đó cài đặt Grafana, Loki
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack --namespace monitoring --create-namespace \
  --set grafana.enabled=false --set promtail.enabled=true
```

- Đảm bảo Loki chạy: `kubectl get pods -n monitoring`
- Port-forward Grafana: `kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80`
- Khi sử dụng lệnh kubectl get pod -n monitoring gặp phải pod grafana bị crashLoopback, sử dụng lệnh sau để khởi chạy lại pod đó `kubectl delete pod -n monitoring -l app.kubernetes.io/name=grafana`
---

## 8. Truy vập Grafana
✅ Cách lấy mật khẩu Grafana

📌 Bước 1: Lấy chuỗi mã hoá base64 từ Secret
`kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}"`=> Kết quả sẽ trả ra một chuỗi dài

📌 Bước 2: Giải mã base64 

`[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String("<chuỗi bạn nhận được>"))`

🎯Gộp lại
```bash
$pwd = kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($pwd))

```

- Lấy mật khẩu mặc định `kubectl get secret monitoring-grafana -n monitoring`, bạn sẽ nhận được đoạn mã và hãy copy lại và sử dụng trình giải mã base64. 


1. Vào tab **Explore**
2. Chọn Datasource: `Loki`
3. Query:
```logql
{pod="attacker"} |= "timeout"
```



---

## 9. Kiểm thử

```bash
kubectl exec -it attacker -n networking-policy-demo -- wget http://app-secure:80
```

➡️ Log bị timeout xuất hiện trong Grafana.

---

## 10. Kết luận

- Calico chặn truy cập xác định theo label và port
- OpenTelemetry thu log từ Pod
- Loki lưu trữ, Grafana hiển thị log theo pod / namespace

✅ Demo bào mật mạng & quan sát log đã hoàn tất



## Kết luận

Project Calico giúp quản lý mạng và bảo mật một cách linh hoạt, hiệu quả trong môi trường Kubernetes. Các chính sách mạng, quan sát, và khả năng bảo mật nâng cao giúp đáp ứng nhu cầu của các hệ thống hiện đại và an toàn.
