# ProJect_Calico
Đánh Giá Hiệu Năng Mạng Máy Tính 


# Project Calico

<img src="Calico_Ghibli.png" alt="Calico" width="325"/>


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



---
<img src="./image/Topology.png" alt="topology" width="300"/>
---

# 📌 **Kịch bản số 1**
Dưới đây là **kịch bản chi tiết và đầy đủ nhất** cho việc mô phỏng một **"cuộc tấn công vào Pod Database"** trong Kubernetes, sử dụng Project Calico để bảo vệ và kiểm soát truy cập. Mình sẽ giải thích từng bước rõ ràng để bạn hiểu cặn kẽ và thực hiện một cách dễ dàng nhất.

**Mục tiêu kịch bản:**

Bạn đang có một hệ thống cơ sở dữ liệu (**PostgreSQL**) chạy trong Kubernetes, và bạn muốn mô phỏng một kịch bản mà một pod độc hại (**attacker pod**) cố tình truy cập trái phép vào database, để kiểm tra hiệu quả của chính sách mạng (**NetworkPolicy**) được quản lý bởi Calico.

---

# ⚙️ **Các thành phần trong demo**

Bạn sẽ có 3 thành phần:

1. **Pod database (PostgreSQL)**:
   - Namespace: `production`
   - Label: `app=db`
   - Port: `5432`
   - User/password database: `demo`/`demo123`

2. **Pod tin cậy (trusted client)**:
   - Label: `role=trusted`
   - Cho phép truy cập vào DB

3. **Pod attacker** (kẻ tấn công):
   - Label: `app=attacker`
   - Không được phép truy cập DB.

---


## 🗂️ **Bước 1: Chuẩn bị môi trường**

Bạn cần có một namespace `production`:

```bash
kubectl create namespace production
```

Triển khai database PostgreSQL:

```bash
kubectl apply -n production -f postgres-db.yaml
```

(Tệp `postgres-db.yaml` đã tạo trước đó, gồm deployment PostgreSQL.)

---

## 🛡️ **Bước 2: Áp dụng NetworkPolicy**

### ① **Default Deny** *(khóa toàn bộ namespace trước)*

`default-deny.yaml`:

```yaml
apiVersion: projectcalico.org/v3
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  selector: all()
  types:
  - Ingress
  - Egress
  ingress: []
  egress: []
```

Áp dụng:

```bash
calicoctl create -f default-deny.yaml
```

➡️ **Tác dụng**: Tất cả traffic vào và ra từ mọi pod đều bị chặn (deny).

---

### ② **Cho phép pod trusted truy cập vào DB**

Tạo file `allow-trusted-to-db.yaml`:

```yaml
apiVersion: projectcalico.org/v3
kind: NetworkPolicy
metadata:
  name: allow-trusted-to-db
  namespace: production
spec:
  selector: app == 'db'
  types: 
  - Ingress
  ingress:
  - action: Allow
    protocol: TCP
    source:
      selector: role == 'trusted'
    destination:
      ports:
      - 5432
```

Áp dụng policy:

```bash
calicoctl create -f allow-trusted-to-db.yaml
```

➡️ **Tác dụng**: Chỉ pod có nhãn `role=trusted` được phép truy cập vào DB trên cổng 5432.

---

## 🚀 **Bước 3: Triển khai pod attacker**

Tạo file `app-attacker.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-attacker
  namespace: production
  labels:
    app: attacker
spec:
  containers:
  - name: attacker
    image: busybox
    command: ["sleep", "3600"]
```

Áp dụng attacker pod:

```bash
kubectl apply -f app-attacker.yaml
```

---

## 🕵️ **Bước 4: Mô phỏng cuộc tấn công từ pod attacker**

### **① Vào trong pod attacker**:

```bash
kubectl exec -it app-attacker -n production -- sh
```

### **② Tấn công vào DB bằng cách quét cổng**:

Thử kiểm tra xem có thể kết nối tới database:

```sh
nc -zv postgres 5432
```

hoặc

```sh
telnet postgres 5432
```

### **③ Kết quả mong đợi (bị chặn)**:

```
postgres (10.96.x.x:5432): Connection timed out
```

hoặc

```
telnet: can't connect to remote host (10.96.x.x): Connection refused
```

➡️ Tức là chính sách Calico đã chặn cuộc tấn công.

---

## ✅ **Bước 5: Mô phỏng truy cập hợp lệ (trusted)**

Tạo nhanh một pod trusted để kiểm thử hợp lệ:

```bash
kubectl run trusted-client --rm -it --image=postgres:15-alpine \
  --namespace=production --labels=role=trusted \
  -- psql -h postgres -U demo -d demodb
```

Kết quả mong đợi:

```
Password for user demo:
```

➡️ Nhập `demo123`, truy cập thành công.

---

## 📊 **Bước 6: Giám sát và log (Observability)**

- Bạn đã cài OpenTelemetry Collector + Loki/Grafana trước đó.

### **① Xem log bị chặn trong Grafana**:

- Mở Grafana ➡️ Explore ➡️ Loki datasource.
- Query log pod attacker:

```logql
{pod="app-attacker"} |= "Connection timed out"
```

- Bạn sẽ thấy rõ log về các cuộc tấn công bị từ chối:
```
app-attacker | wget: connection timed out
app-attacker | nc: connection timed out
```

➡️ Cho thấy policy của Calico hoạt động tốt.

---

# 📌 **Tóm tắt toàn bộ kịch bản (slide)**

#### 1. Chuẩn bị môi trường & Pod database.
#### 2. Áp dụng chính sách mạng Calico:
   - **Default deny** (chặn toàn bộ).
   - **Cho phép trusted vào DB**.
#### 3. Pod attacker cố tấn công vào DB (thất bại).
#### 4. Pod trusted truy cập DB (thành công).
#### 5. Xác nhận log trong Grafana thể hiện rõ traffic bị chặn.

---


## 📝 **Tại sao làm demo này? (Giải thích thêm)**

- *Chứng minh khả năng bảo vệ mạng nội bộ với Calico.*
- *Minh họa mô hình Zero Trust.*
- *Quan sát trực quan và log rõ ràng về các cuộc tấn công bị chặn.*

---

# 📌 **Kịch bản số 2** 
Mô tả: Đây sẽ là kịch bản demo về khả năng mã hóa của calico với WireGuard. Traffic giữa pod-to-pod sẽ được mã hóa ngăn chặn nghe lén và đảm bảo bảo mật dữ liệu

🎯 Mục tiêu:
- Minh họa rằng Calico có thể mã hóa tất cả lưu lượng giữa các node.

- So sánh lưu lượng trước/sau khi bật mã hóa.

- Dùng Wireshark hoặc tcpdump để chứng minh rằng lưu lượng đã được mã hóa (không đọc được nội dung).

## Kiểm tra  môi trường hỗ trợ
- *Kernel ≥ 5.6 (Ubuntu 20.04/22.04)*
- *Calico >v3.13*
- *CNI Calico đang chạy*

## 🧪 Bước 1: Bật mã hóa WireGuard trong Calico
⚙️ Cấu hình đơn giản bằng calicoctl
```bash
calicoctl patch felixconfiguration default --patch='{"spec": {"wireguardEnabled": true}}'
```

## 🔍 Bước 2: Kiểm tra trạng thái WireGuard
```bash
calicoctl get node -o wide
```
➡️ Sẽ có cột Wireguard Public Key hiển thị

ssh vào node để kiểm tra: 
```bash
sudo wg show
```
➡️ Sẽ thấy các interface và peer mã hóa với wg0 hoặc wg.calico

## 📦 Bước 3: Gửi lưu lượng giữa 2 pod trên 2 node khác nhau
```bash
kubectl exec -it pod-A -- curl pod-B
```
➡️ Đảm bảo 2 pod chạy trên 2 node khác nhau

## 🕵️ Bước 4: Bắt gói tin và chứng minh đã mã hóa
- SSH vào 1 node bất kỳ và dùng tcpdump:
```bash
sudo tcpdump -i <interface> port 51820
```

📌 51820 là cổng WireGuard mặc định
- Nếu chưa bật WireGuard ➝ bạn sẽ thấy gói TCP thông thường
- Nếu đã bật ➝ bạn sẽ chỉ thấy gói UDP mã hóa, không đọc được nội dung payload

## 📈 Bước 5: Kết hợp giám sát
- Trong Grafana: có thể giám sát lưu lượng outbound pod
- Trong log: có thể log lại các kết nối giữa các node


## Kết luận

Project Calico giúp quản lý mạng và bảo mật một cách linh hoạt, hiệu quả trong môi trường Kubernetes. Các chính sách mạng, quan sát, và khả năng bảo mật nâng cao giúp đáp ứng nhu cầu của các hệ thống hiện đại và an toàn.


