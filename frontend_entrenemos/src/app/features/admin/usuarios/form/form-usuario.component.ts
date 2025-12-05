import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Usuario } from "../../../../shared/models/usuario";
import { UsuariosService } from "../../../../core/services/usuarios.service";

@Component({
  selector: "app-form-usuario",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./form-usuario.component.html",
  styleUrls: ["./form-usuario.component.css"],
})
export class FormUsuarioComponent implements OnInit {
  usuario: Usuario = {} as Usuario;
  editando = false;

  constructor(
    private service: UsuariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.editando = true;
      this.service
        .obtenerUsuario(+id)
        .subscribe((u: Usuario) => (this.usuario = u));
    }
  }

  guardar(): void {
    if (this.editando) {
      this.service
        .actualizarUsuario(this.usuario.id!, this.usuario)
        .subscribe(() => this.router.navigate(["/admin/usuarios"]));
    } else {
      this.service
        .crearUsuario(this.usuario)
        .subscribe(() => this.router.navigate(["/admin/usuarios"]));
    }
  }
}
