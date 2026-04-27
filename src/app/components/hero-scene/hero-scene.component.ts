import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-hero-scene',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full">
      <canvas #canvas id="hero-canvas" class="w-full h-full opacity-90"></canvas>
    </div>
  `
})
export class HeroSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private laptopGroup!: THREE.Group;
  private pcGroup!: THREE.Group;
  private animFrame!: number;
  private mouseX = 0;
  private mouseY = 0;
  private targetRotX = 0;
  private targetRotY = 0;
  private floatOffset = 0;
  private destroyed = false;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initScene();
      this.animate();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (typeof window !== 'undefined' && this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.renderer) this.renderer.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 400;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x6366f1, 1.5);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 20);
    pointLight.position.set(-3, 2, 3);
    this.scene.add(pointLight);

    // Create laptop group
    this.laptopGroup = this.createLaptop();
    this.laptopGroup.position.set(-1.5, 0, 0);
    this.scene.add(this.laptopGroup);

    // Create PC group
    this.pcGroup = this.createPC();
    this.pcGroup.position.set(2, -0.5, 0);
    this.scene.add(this.pcGroup);

    // Floating particles
    this.addParticles();
  }

  private createLaptop(): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 100 });
    const screenMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    const logoMat = new THREE.MeshPhongMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.8 });

    // Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 2), mat);
    base.position.y = -0.8;
    group.add(base);

    // Screen lid
    const lid = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.1), mat);
    lid.position.set(0, 0.3, -0.95);
    lid.rotation.x = -0.3;
    group.add(lid);

    // Screen display
    const screen = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.7, 0.05), screenMat);
    screen.position.set(0, 0.3, -0.9);
    screen.rotation.x = -0.3;
    group.add(screen);

    // Logo on screen
    const logo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.06), logoMat);
    logo.position.set(0, 0.3, -0.87);
    logo.rotation.x = -0.3;
    group.add(logo);

    // Keyboard
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 1.6), new THREE.MeshPhongMaterial({ color: 0x334155 }));
    keyboard.position.set(0, -0.72, 0);
    group.add(keyboard);

    return group;
  }

  private createPC(): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 80 });
    const screenMat = new THREE.MeshPhongMaterial({ color: 0x6366f1, emissive: 0x4f46e5, emissiveIntensity: 0.5 });
    const accentMat = new THREE.MeshPhongMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 0.6 });

    // Monitor
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 0.15), mat);
    monitor.position.set(0, 1, 0);
    group.add(monitor);

    // Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.1), screenMat);
    screen.position.set(0, 1, 0.08);
    group.add(screen);

    // Monitor stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), mat);
    stand.position.set(0, 0, 0);
    group.add(stand);

    // Stand base
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.8), mat);
    standBase.position.set(0, -0.4, 0);
    group.add(standBase);

    // Tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 1), mat);
    tower.position.set(-2.2, 0, 0);
    group.add(tower);

    // Tower accent stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.95), accentMat);
    stripe.position.set(-1.8, 0, 0);
    group.add(stripe);

    // Tower LED
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), new THREE.MeshPhongMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 2 }));
    led.position.set(-1.79, 0.7, 0);
    group.add(led);

    return group;
  }

  private addParticles(): void {
    const geometry = new THREE.BufferGeometry();
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 16;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x6366f1, size: 0.06, transparent: true, opacity: 0.6 });
    this.scene.add(new THREE.Points(geometry, mat));
  }

  private animate(): void {
    if (this.destroyed) return;
    this.animFrame = requestAnimationFrame(() => this.animate());

    this.floatOffset += 0.015;

    // Smooth mouse tracking
    this.targetRotY += (this.mouseX * 0.3 - this.targetRotY) * 0.05;
    this.targetRotX += (this.mouseY * 0.2 - this.targetRotX) * 0.05;

    // Apply rotation and float
    this.laptopGroup.rotation.y = this.targetRotY;
    this.laptopGroup.rotation.x = this.targetRotX;
    this.laptopGroup.position.y = Math.sin(this.floatOffset) * 0.15;

    this.pcGroup.rotation.y = this.targetRotY * 0.6;
    this.pcGroup.position.y = -0.5 + Math.sin(this.floatOffset + 1) * 0.12;

    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (typeof window !== 'undefined') {
      this.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
