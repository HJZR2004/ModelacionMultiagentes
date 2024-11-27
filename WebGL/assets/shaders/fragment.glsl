#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_lightDirection;
in vec3 v_cameraDirection;

// Scene uniforms
uniform vec4 u_ambientLight;
uniform vec4 u_diffuseLight;
uniform vec4 u_specularLight;

// Model uniforms
uniform vec4 u_ambientColor;
uniform vec4 u_diffuseColor;
uniform vec4 u_specularColor;
uniform float u_shininess;

out vec4 outColor;

void main() {
    vec4 ambient = u_ambientLight * u_ambientColor;

    vec4 diffuse = vec4(0, 0, 0, 1);
    vec3 v_n_n = normalize(v_normal);
    vec3 v_l_n = normalize(v_lightDirection);
    float lambert = dot(v_n_n, v_l_n);
    if (lambert > 0.0) {
        diffuse = u_diffuseLight * u_diffuseColor * lambert;
    }

    vec3 vc_n = normalize(v_cameraDirection);
    vec3 v_r_n = reflect(-v_l_n, v_n_n);
    float dot_n_r = max(dot(vc_n, v_r_n), 0.0);
    vec4 specular = u_specularColor * u_specularLight * pow(dot_n_r, u_shininess);

    outColor = ambient + diffuse + specular;
}